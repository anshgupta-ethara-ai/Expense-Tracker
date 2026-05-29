'use client';
import { useEffect, useState } from 'react';
import { exportToCSV, formatCurrency } from '@/lib/helpers';
import dynamic from 'next/dynamic';

const SpendingChart = dynamic(() => import('@/components/SpendingChart'), { ssr: false });

export default function ReportsPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState([]);
  const [role, setRole] = useState('member');
  const currentMonthStr = new Date().toISOString().substring(0, 7);

  useEffect(() => {
    async function loadReportSystem() {
      const [meRes, expRes, catRes] = await Promise.all([
        fetch('/api/profiles/me'),
        fetch('/api/expenses'),
        fetch('/api/categories')
      ]);

      if (meRes.ok && expRes.ok && catRes.ok) {
        const me = await meRes.json();
        const rawExpenses = await expRes.json();
        const rawCategories = await catRes.json();
        
        setRole(me.role);
        setExpenses(rawExpenses);
        setCategories(rawCategories);

        const currentMonthExpenses = rawExpenses.filter(e => e.date.startsWith(currentMonthStr));
        const computedMap = {};
        rawCategories.forEach(c => { computedMap[c.id] = { name: c.name, color: c.color, value: 0 }; });
        
        currentMonthExpenses.forEach(e => {
          if (computedMap[e.category_id]) computedMap[e.category_id].value += Number(e.amount);
        });

        setSummary(Object.values(computedMap).filter(item => item.value > 0));
      }
    }
    loadReportSystem();
  }, []);

  const isAdmin = role === 'admin';

  const triggerExport = () => {
    const serialized = expenses.map(e => ({
      ID: e.id,
      Title: e.title,
      Amount: e.amount,
      Date: e.date,
      PaymentMode: e.payment_mode,
      Notes: e.notes || ''
    }));
    exportToCSV(serialized, `Expense_Report_${currentMonthStr}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Structured Statements</h1>
        <button onClick={triggerExport} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition">
          Export Database (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Category Volume Share</h3>
          <SpendingChart data={summary} />
        </div>
        
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-700">Financial Ledger Breakdown</h3>
          <div className="divide-y max-h-64 overflow-y-auto pr-1">
            {summary.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2.5 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
            {!summary.length && <div className="text-gray-400 text-sm py-4">No logged statements.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
