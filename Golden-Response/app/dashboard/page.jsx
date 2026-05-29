'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { formatCurrency } from '@/lib/helpers';

const SpendingChart = dynamic(() => import('@/components/SpendingChart'), { ssr: false });

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({ totalSpent: 0, totalBudget: 0, chartData: [], userCount: 0, role: 'member' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [meRes, expRes, budRes, catRes] = await Promise.all([
          fetch('/api/profiles/me'),
          fetch('/api/expenses'),
          fetch('/api/budgets'),
          fetch('/api/categories')
        ]);

        const me = await meRes.json();
        const expenses = await expRes.json();
        const budgets = await budRes.json();
        const categories = await catRes.json();

        let userCount = 0;
        if (me.role === 'admin') {
          const profRes = await fetch('/api/profiles');
          const profiles = await profRes.json();
          userCount = profiles.length;
        }

        const currentMonthStr = new Date().toISOString().substring(0, 7);
        const thisMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr));
        const thisMonthBudgets = budgets.filter(b => b.month === currentMonthStr);

        const totalSpent = thisMonthExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
        const baseBudget = thisMonthBudgets.reduce((sum, item) => sum + Number(item.amount_limit), 0);
        const totalBudget = me.role === 'admin' ? baseBudget * userCount : baseBudget;

        const chartMap = {};
        categories.forEach(c => { chartMap[c.id] = { name: c.name, color: c.color, value: 0 }; });
        
        thisMonthExpenses.forEach(e => {
          if (chartMap[e.category_id]) {
            chartMap[e.category_id].value += Number(e.amount);
          }
        });

        console.log('Dashboard Data Loaded:', { totalSpent, totalBudget, userCount, role: me.role });

        setMetrics({
          totalSpent,
          totalBudget,
          chartData: Object.values(chartMap).filter(item => item.value > 0),
          userCount,
          role: me.role
        });
      } catch (err) {
        console.error("Failed loading dashboard aggregation metric", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Recalculating core ledgers...</div>;

  const budgetRemaining = metrics.totalBudget - metrics.totalSpent;
  const isAdmin = metrics.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAdmin ? 'System Oversight Dashboard' : 'Financial Blueprint Dashboard'}
          </h1>
          <p className="text-sm text-gray-500">
            {isAdmin ? 'Global platform statistics and totals.' : 'Your personal monthly financial summary.'}
          </p>
        </div>
        {isAdmin && (
          <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            ADMIN OVERRIDE ACTIVE
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <p className="text-sm font-medium text-gray-500">{isAdmin ? 'Total System Spend' : 'Spent This Month'}</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{formatCurrency(metrics.totalSpent)}</p>
          {isAdmin && <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 -mr-12 -mt-12 rounded-full opacity-50"></div>}
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">{isAdmin ? 'Aggregated Budget Limits' : 'Allocated Budget Total'}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(metrics.totalBudget)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          {isAdmin ? (
             <>
               <p className="text-sm font-medium text-gray-500">Active Platform Users</p>
               <p className="text-3xl font-bold text-indigo-600 mt-1">{metrics.userCount}</p>
             </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-500">Remaining Pool Allocation</p>
              <p className={`text-3xl font-bold mt-1 ${budgetRemaining >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                {formatCurrency(budgetRemaining)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-md font-semibold text-gray-700 mb-2">
          {isAdmin ? 'Global Category Breakdown' : 'Category Breakdown (Current Month)'}
        </h3>
        <SpendingChart data={metrics.chartData} />
      </div>
    </div>
  );
}
