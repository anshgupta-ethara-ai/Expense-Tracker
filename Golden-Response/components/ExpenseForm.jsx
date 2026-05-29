'use client';
import { useState, useEffect } from 'react';

export default function ExpenseForm({ expense, categories, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [paymentMode, setPaymentMode] = useState('cash');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount);
      setCategoryId(expense.category_id || '');
      setDate(expense.date);
      setPaymentMode(expense.payment_mode);
      setNotes(expense.notes || '');
    }
  }, [expense]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is mandatory';
    if (!amount || Number(amount) <= 0) errs.amount = 'Amount must be greater than zero';
    if (!categoryId) errs.categoryId = 'Category matching is mandatory';
    if (!date) errs.date = 'Transaction date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const runtimeErrors = validate();
    if (Object.keys(runtimeErrors).length > 0) {
      setErrors(runtimeErrors);
      return;
    }

    setSubmitting(true);
    let receiptUrl = expense?.receipt_url || '';

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', fileName);

      // Simple implementation assuming client directly interacts with Supabase storage via public API context or dedicated routes
      // For this framework architecture workflow wrapper:
      receiptUrl = fileName; 
    }

    const payload = { title, amount: Number(amount), category_id: categoryId, date, payment_mode: paymentMode, notes, receipt_url: receiptUrl };
    const method = expense ? 'PUT' : 'POST';
    const endpoint = expense ? `/api/expenses/${expense.id}` : '/api/expenses';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      onSave();
    } else {
      alert('Operation execution encountered an processing exception inside DB layers.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <h3 className="text-lg font-bold mb-4">{expense ? 'Edit Expense Instance' : 'Log New Expense Transaction'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Expense Label/Title</label>
            <input type="text" className="w-full border rounded-lg p-2 text-sm" value={title} onChange={e => setTitle(e.target.value)} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Value Amount ($)</label>
              <input type="number" step="0.01" className="w-full border rounded-lg p-2 text-sm" value={amount} onChange={e => setAmount(e.target.value)} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
              <input type="date" className="w-full border rounded-lg p-2 text-sm" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <select className="w-full border rounded-lg p-2 text-sm bg-white" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Choose...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Engine</label>
              <select className="w-full border rounded-lg p-2 text-sm bg-white" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="UPI">UPI Interface</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (Optional)</label>
            <textarea className="w-full border rounded-lg p-2 text-sm h-16 resize-none" value={notes} onChange={e => setNotes(e.target.value)}></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Receipt Attachment (Max 5MB Image/PDF)</label>
            <input type="file" accept="image/*,application/pdf" className="w-full text-xs" onChange={e => setFile(e.target.files[0])} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400">
              {submitting ? 'Saving changes...' : 'Commit Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
