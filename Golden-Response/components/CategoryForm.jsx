'use client';
import { useState } from 'react';

export default function CategoryForm({ category, onClose, onSave }) {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#3B82F6');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const payload = { name, color };
    const method = category ? 'PUT' : 'POST';
    const endpoint = category ? `/api/categories/${category.id}` : '/api/categories';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      onSave();
    } else {
      alert('Failed to save category');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative">
        <h3 className="text-lg font-bold mb-4">{category ? 'Edit Category' : 'New Category'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category Name</label>
            <input 
              type="text" 
              className="w-full border rounded-lg p-2 text-sm" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Food, Transport"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Theme Color</label>
            <div className="flex gap-2 items-center">
              <input 
                type="color" 
                className="w-10 h-10 border-none p-0 cursor-pointer" 
                value={color} 
                onChange={e => setColor(e.target.value)} 
              />
              <input 
                type="text" 
                className="flex-1 border rounded-lg p-2 text-sm font-mono" 
                value={color} 
                onChange={e => setColor(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400">
              {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
