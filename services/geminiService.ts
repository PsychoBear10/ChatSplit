
import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData, ReceiptItem, Assignments } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      description: "List of items purchased.",
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Name of the item, should be unique." },
          price: { type: Type.NUMBER, description: "Price of the single item." }
        },
        required: ["description", "price"]
      }
    },
    subtotal: { type: Type.NUMBER, description: "The subtotal before tax and tip." },
    tax: { type: Type.NUMBER, description: "The total tax amount." },
    tip: { type: Type.NUMBER, description: "The total tip amount, calculated if not explicit." },
    total: { type: Type.NUMBER, description: "The final total amount." }
  },
  required: ["items", "subtotal", "tax", "tip", "total"]
};

const assignmentsSchema = {
    type: Type.OBJECT,
    properties: {
      assignments: {
        type: Type.ARRAY,
        description: "The updated list of item assignments.",
        items: {
          type: Type.OBJECT,
          properties: {
            item: {
              type: Type.STRING,
              description: "The description of the receipt item."
            },
            people: {
              type: Type.ARRAY,
              description: "An array of names assigned to this item.",
              items: {
                type: Type.STRING
              }
            }
          },
          required: ["item", "people"]
        }
      }
    },
    required: ["assignments"]
};

export const parseReceipt = async (imageFile: File): Promise<ReceiptData> => {
  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = `You are an expert receipt processor. Analyze this receipt image and extract all line items with their individual prices. Also, identify the subtotal, tax, and total amount. If a tip is explicitly mentioned, extract it. If not, calculate the tip by subtracting the subtotal and tax from the total. The output must be a valid JSON object that strictly adheres to the provided schema. Do not include any text outside of the JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: receiptSchema
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText) as ReceiptData;
    // Ensure item descriptions are unique for assignment mapping
    const uniqueItems = new Map<string, ReceiptItem>();
    parsedData.items.forEach((item, index) => {
      let desc = item.description;
      let counter = 2;
      while (uniqueItems.has(desc)) {
        desc = `${item.description} (${counter++})`;
      }
      uniqueItems.set(desc, { ...item, description: desc });
    });
    return { ...parsedData, items: Array.from(uniqueItems.values()) };
  } catch (error) {
    console.error("Error parsing receipt:", error);
    throw new Error("Failed to analyze the receipt. Please try a clearer image.");
  }
};

export const updateAssignments = async (items: ReceiptItem[], currentAssignments: Assignments, command: string): Promise<Assignments> => {
    const prompt = `You are a bill-splitting assistant. Your task is to update the assignment of people to receipt items based on a user's command.

Current state:
- Items on the receipt: ${JSON.stringify(items.map(i => i.description))}
- Current assignments: ${JSON.stringify(currentAssignments)}

User command: "${command}"

Instructions:
1. Analyze the command to update the assignments. People's names are case-insensitive; standardize them to start with a capital letter (e.g., "dhruv" becomes "Dhruv").
2. If an item in the command is a partial match for an item description, use the closest full match from the list.
3. A person can be added to or removed from an item's assignment list.
4. If a new person is mentioned, add them.
5. The final output must contain an entry for every single item on the receipt, even if no one is assigned to it (people: []).

Return ONLY the complete, updated JSON object representing the new assignments, matching the provided schema. Do not add any text, explanation, or markdown.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: assignmentsSchema,
            },
        });
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText) as { assignments: { item: string; people: string[] }[] };
        
        const newAssignments: Assignments = {};
        items.forEach(item => {
            newAssignments[item.description] = [];
        });

        parsedResponse.assignments.forEach(assignment => {
            // Find the canonical item description in case the model slightly alters it
            const matchingItem = items.find(item => item.description.toLowerCase() === assignment.item.toLowerCase());
            if (matchingItem) {
                newAssignments[matchingItem.description] = assignment.people;
            }
        });

        return newAssignments;
    } catch (error) {
        console.error("Error updating assignments:", error);
        throw new Error("I couldn't understand that. Please try rephrasing your command.");
    }
};
