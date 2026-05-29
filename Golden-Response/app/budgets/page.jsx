'use client';
import { useEffect, useState } from 'react';
import BudgetCard from '@/components/BudgetCard';

export default function BudgetsPage() {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('member');
  const [editingBudget, setEditingBudget] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [inputLimit, setInputLimit] = useState('');
  const [loading, setLoading] = useState(true);
  
  const currentMonthStr = new Date().toISOString().substring(0, 7);

  const loadData = async () => {
    const [meRes, catRes, budRes, expRes] = await Promise.all([
      fetch('/api/profiles/me'),
      fetch('/api/categories'),
      fetch('/api/budgets'),
      fetch('/api/expenses')
    ]);
    
    if (meRes.ok && catRes.ok && budRes.ok && expRes.ok) {
      const me = await meRes.json();
      setRole(me.role);
      setCurrentUserId(me.id);
      setCategories(await catRes.json());
      setBudgets(await budRes.json());
      setExpenses(await expRes.json());
      
      if (me.role === 'admin') {
        const profRes = await fetch('/api/profiles');
        const allProfiles = await profRes.json();
        setProfiles(allProfiles);
        // Default select self as admin initially
        setSelectedUser(allProfiles.find(p => p.id === me.id) || allProfiles[0]);
      } else {
        setSelectedUser(me);
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const isAdmin = role === 'admin';

  const handleOpenSetup = (catId, currentLimit) => {
    if (!isAdmin) return;
    const existing = budgets.find(b => b.category_id === catId && b.month === currentMonthStr);
    setEditingBudget({ categoryId: catId, budgetId: existing?.id || null });
    setInputLimit(currentLimit || '0');
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const payload = {
      category_id: editingBudget.categoryId,
      month: currentMonthStr,
      amount_limit: Number(inputLimit),
      user_id: currentUserId
    };

    const endpoint = editingBudget.budgetId ? `/api/budgets/${editingBudget.budgetId}` : '/api/budgets';
    const method = editingBudget.budgetId ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setEditingBudget(null);
      loadData();
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading budget matrix...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monthly Structural Budgets</h1>
          <p className="text-sm text-gray-500">Targets for {currentMonthStr}</p>
        </div>
        
        {isAdmin && (
          <div className="bg-white border p-2 rounded-lg flex items-center gap-2 shadow-sm">
            <span className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-widest">Managing:</span>
            <select 
              className="text-sm border-none bg-transparent font-semibold focus:ring-0 cursor-pointer"
              value={selectedUser?.id || ''}
              onChange={(e) => setSelectedUser(profiles.find(p => p.id === e.target.value))}
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map(cat => {
            const matchedBudget = budgets.find(b => b.category_id === cat.id && b.month === currentMonthStr);
            const totalSpent = expenses
              .filter(e => e.category_id === cat.id && e.date.startsWith(currentMonthStr) && e.user_id === selectedUser?.id)
              .reduce((sum, item) => sum + Number(item.amount), 0);
            
            const limit = matchedBudget ? Number(matchedBudget.amount_limit) : 0;

            return (
              <div key={cat.id} className="relative group">
                <BudgetCard categoryName={cat.name} color={cat.color} limit={limit} spent={totalSpent} />
                {isAdmin && (
                  <div className="mt-2 text-right">
                    <button onClick={() => handleOpenSetup(cat.id, limit)} className="text-xs text-indigo-600 hover:underline font-medium">
                      Adjust Target
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-white border border-dashed rounded-2xl">
          <p className="text-gray-500 mb-2">No categories available to set budgets for.</p>
          <p className="text-sm text-gray-400">Please contact an administrator to create expense categories.</p>
        </div>
      )}

      {editingBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveBudget} className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-gray-700">Set Allocation Cap</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Monthly Spending Target ($)</label>
              <input type="number" min="0" step="0.01" className="w-full border rounded-lg p-2 text-sm" value={inputLimit} onChange={e => setInputLimit(e.target.value)} required />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setEditingBudget(null)} className="px-3 py-2 border rounded-lg font-medium">Discard</button>
              <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg font-medium">Save Track Matrix</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
