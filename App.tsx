
import React, { useState, useEffect, useCallback } from 'react';
import ReceiptUploader from './components/ReceiptUploader';
import ReceiptView from './components/ReceiptView';
import ChatInterface from './components/ChatInterface';
import { parseReceipt, updateAssignments } from './services/geminiService';
import type { ReceiptData, Assignments, ChatMessage } from './types';

const App: React.FC = () => {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [peopleTotals, setPeopleTotals] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setChatHistory([]);
    try {
      const data = await parseReceipt(file);
      setReceiptData(data);
      const initialAssignments: Assignments = {};
      data.items.forEach(item => {
        initialAssignments[item.description] = [];
      });
      setAssignments(initialAssignments);
      setChatHistory([{
        id: Date.now().toString(),
        sender: 'bot',
        text: "Great! I've read the receipt. Now, tell me who had what."
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!receiptData) return;
    
    const newUserMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text: message };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsProcessing(true);
    setError(null);

    try {
      const newAssignments = await updateAssignments(receiptData.items, assignments, message);
      setAssignments(newAssignments);

      const botResponse: ChatMessage = { id: `bot-${Date.now()}`, sender: 'bot', text: "Got it! I've updated the bill." };
      setChatHistory(prev => [...prev, botResponse]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      const errorResponse: ChatMessage = { id: `bot-error-${Date.now()}`, sender: 'bot', text: `Sorry, there was an issue: ${errorMessage}` };
      setChatHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const calculateTotals = useCallback(() => {
    if (!receiptData) return;

    const newPeopleTotals: Record<string, number> = {};
    const peopleSubtotals: Record<string, number> = {};
    let totalAssignedSubtotal = 0;

    // Calculate individual subtotals
    Object.entries(assignments).forEach(([itemDesc, people]) => {
      if (people.length > 0) {
        const item = receiptData.items.find(i => i.description === itemDesc);
        if (item) {
          const share = item.price / people.length;
          totalAssignedSubtotal += item.price;
          people.forEach(person => {
            if (!peopleSubtotals[person]) peopleSubtotals[person] = 0;
            peopleSubtotals[person] += share;
          });
        }
      }
    });

    // Distribute tax and tip proportionally
    const totalTaxAndTip = receiptData.tax + receiptData.tip;

    Object.entries(peopleSubtotals).forEach(([person, subtotal]) => {
      const proportion = totalAssignedSubtotal > 0 ? subtotal / totalAssignedSubtotal : 0;
      const shareOfTaxAndTip = totalTaxAndTip * proportion;
      newPeopleTotals[person] = subtotal + shareOfTaxAndTip;
    });

    setPeopleTotals(newPeopleTotals);
  }, [assignments, receiptData]);

  useEffect(() => {
    if (receiptData) {
      calculateTotals();
    }
  }, [receiptData, assignments, calculateTotals]);


  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      {!receiptData ? (
        <ReceiptUploader onUpload={handleUpload} isLoading={isLoading} error={error} />
      ) : (
        <div className="w-full max-w-7xl mx-auto h-[90vh] grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-full">
            <ReceiptView receiptData={receiptData} assignments={assignments} />
          </div>
          <div className="h-full">
            <ChatInterface
              peopleTotals={peopleTotals}
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
              chatHistory={chatHistory}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default App;
