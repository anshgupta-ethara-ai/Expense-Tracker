'use client';
import { useEffect, useState } from 'react';
import ExpenseList from '@/components/ExpenseList';
import ExpenseForm from '@/components/ExpenseForm';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [role, setRole] = useState('member');
  const [formOpen, setFormOpen] = useState(false);
  const [activeExpense, setActiveExpense] = useState(null);
  
  // Filters state tracking
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const loadData = async () => {
    const [meRes, expRes, catRes] = await Promise.all([
      fetch('/api/profiles/me'),
      fetch('/api/expenses'), 
      fetch('/api/categories')
    ]);
    
    if (expRes.ok && catRes.ok && meRes.ok) {
      const me = await meRes.json();
      setRole(me.role);
      setExpenses(await expRes.json());
      setCategories(await catRes.json());
      
      if (me.role === 'admin') {
        const profRes = await fetch('/api/profiles');
        setProfiles(await profRes.json());
      }
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to permanently delete this transaction?')) {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    }
  };

  const handleEditInit = (expense) => {
    setActiveExpense(expense);
    setFormOpen(true);
  };

  const filteredExpenses = expenses.filter(exp => {
    if (categoryFilter && exp.category_id !== categoryFilter) return false;
    if (paymentFilter && exp.payment_mode !== paymentFilter) return false;
    if (dateFilter && exp.date !== dateFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Ledger Operations</h1>
        <button onClick={() => { setActiveExpense(null); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition">
          + Add Expense Log
        </button>
      </div>

      {/* Filter Toolbar Ecosystem */}
      <div className="bg-white border p-4 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Filter Category</label>
          <select className="w-full border rounded-lg p-2 text-sm bg-gray-50" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Payment Configuration</label>
          <select className="w-full border rounded-lg p-2 text-sm bg-gray-50" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
            <option value="">All Payment Modes</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Accurate Date</label>
          <input type="date" className="w-full border rounded-lg p-2 text-sm bg-gray-50" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
      </div>

      <ExpenseList 
        expenses={filteredExpenses} 
        categories={categories} 
        profiles={profiles}
        role={role}
        onEdit={handleEditInit} 
        onDelete={handleDelete} 
      />

      {formOpen && (
        <ExpenseForm expense={activeExpense} categories={categories} onClose={() => setFormOpen(false)} onSave={() => { setFormOpen(false); loadData(); }} />
      )}
    </div>
  );
}
