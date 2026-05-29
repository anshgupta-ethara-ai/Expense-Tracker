'use client';
import { useEffect, useState } from 'react';
import CategoryForm from '@/components/CategoryForm';
import { createClient } from '@/lib/supabase-browser';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('member');
  const supabase = createClient();

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      setRole(profile?.role || 'member');
    }

    const res = await fetch('/api/categories');
    if (res.ok) {
      setCategories(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const isAdmin = role === 'admin';

  const handleDelete = async (id) => {
    if (confirm('Are you sure? This will unassign all expenses linked to this category.')) {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    }
  };

  const handleEdit = (cat) => {
    setActiveCategory(cat);
    setFormOpen(true);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading categories...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
        {isAdmin && (
          <button 
            onClick={() => { setActiveCategory(null); setFormOpen(true); }} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition"
          >
            + Add Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></div>
              <span className="font-medium text-gray-800">{cat.name}</span>
            </div>
            {isAdmin && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => handleEdit(cat)} className="text-indigo-600 hover:text-indigo-900 text-xs font-medium">Edit</button>
                <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900 text-xs font-medium">Delete</button>
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 border border-dashed rounded-xl text-gray-400">
            No categories created yet. {isAdmin ? 'Create one to start logging expenses.' : 'Ask an admin to create one.'}
          </div>
        )}
      </div>

      {formOpen && (
        <CategoryForm 
          category={activeCategory} 
          onClose={() => setFormOpen(false)} 
          onSave={() => { setFormOpen(false); loadData(); }} 
        />
      )}
    </div>
  );
}
