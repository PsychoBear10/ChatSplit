
export interface ReceiptItem {
  description: string;
  price: number;
}

export interface ReceiptData {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export type Assignments = Record<string, string[]>;
