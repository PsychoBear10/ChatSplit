
import React, { useState, useRef, useEffect } from 'react';
import BillSummary from './BillSummary';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  peopleTotals: Record<string, number>;
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  chatHistory: ChatMessage[];
}

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);


const ChatInterface: React.FC<ChatInterfaceProps> = ({ peopleTotals, onSendMessage, isProcessing, chatHistory }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 p-4 md:p-6 rounded-2xl shadow-inner">
      <BillSummary peopleTotals={peopleTotals} />
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {chatHistory.map((chat) => (
          <div key={chat.id} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                chat.sender === 'user' 
                ? 'bg-indigo-500 text-white rounded-br-none' 
                : 'bg-white text-slate-800 rounded-bl-none shadow-sm'
            }`}>
              <p className="text-sm">{chat.text}</p>
            </div>
          </div>
        ))}
         {isProcessing && (
            <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-white text-slate-800 rounded-bl-none shadow-sm flex items-center space-x-2">
                    <span className="block w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="block w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="block w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g., 'Sue and Dhruv shared the pizza'"
          className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={isProcessing || !message.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
