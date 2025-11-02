
import React from 'react';

interface BillSummaryProps {
  peopleTotals: Record<string, number>;
}

const BillSummary: React.FC<BillSummaryProps> = ({ peopleTotals }) => {
  const people = Object.keys(peopleTotals);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-4">
      <h3 className="text-lg font-bold text-slate-700 mb-3 border-b pb-2">Who Owes What</h3>
      {people.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">Assign items in the chat to see the breakdown.</p>
      ) : (
        <div className="space-y-3">
          {people.map((name) => (
            <div key={name} className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
              <span className="font-medium text-slate-800">{name}</span>
              <span className="font-semibold text-indigo-600">{formatCurrency(peopleTotals[name])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillSummary;
