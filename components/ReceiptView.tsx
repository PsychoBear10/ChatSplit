
import React from 'react';
import { ReceiptData, Assignments } from '../types';

interface ReceiptViewProps {
  receiptData: ReceiptData;
  assignments: Assignments;
}

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);


const ReceiptView: React.FC<ReceiptViewProps> = ({ receiptData, assignments }) => {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 border-b pb-4 text-slate-700">Receipt Details</h2>
      <div className="space-y-4">
        {receiptData.items.map((item) => (
          <div key={item.description} className="p-3 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-slate-800 font-medium break-all pr-2">{item.description}</span>
              <span className="text-slate-800 font-semibold whitespace-nowrap">{formatCurrency(item.price)}</span>
            </div>
            {assignments[item.description] && assignments[item.description].length > 0 && (
              <div className="flex items-center mt-2 space-x-2 text-sm text-slate-500">
                <UserIcon className="h-4 w-4 text-slate-400" />
                <span>{assignments[item.description].join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 border-t-2 border-dashed pt-6 space-y-3">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatCurrency(receiptData.subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Tax</span>
          <span>{formatCurrency(receiptData.tax)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Tip</span>
          <span>{formatCurrency(receiptData.tip)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-slate-800 pt-3 border-t">
          <span>Total</span>
          <span>{formatCurrency(receiptData.total)}</span>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;
