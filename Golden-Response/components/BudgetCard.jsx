'use client';
import { formatCurrency } from '@/lib/helpers';

export default function BudgetCard({ categoryName, color, limit, spent }) {
  const usagePercentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isExceeded = spent > limit;

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <span className="inline-flex items-center gap-2 font-semibold text-gray-800">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
          {categoryName}
        </span>
        {isExceeded && (
          <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded border border-red-200 font-medium">
            Over Budget
          </span>
        )}
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Spent: {formatCurrency(spent)}</span>
          <span>Limit: {formatCurrency(limit)}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div className={`h-2.5 rounded-full transition-all duration-500 ${isExceeded ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${usagePercentage}%` }}></div>
        </div>
      </div>

      <div className="text-right text-xs">
        {isExceeded ? (
          <span className="text-red-500 font-medium">Deficit of {formatCurrency(spent - limit)}</span>
        ) : (
          <span className="text-green-600 font-medium">Safe margin: {formatCurrency(limit - spent)}</span>
        )}
      </div>
    </div>
  );
}
