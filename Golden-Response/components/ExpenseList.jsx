'use client';
import { formatDate, formatCurrency } from '@/lib/helpers';

export default function ExpenseList({ expenses, categories, profiles, role, onEdit, onDelete }) {
  const getCategoryDetails = (catId) => {
    return categories.find(c => c.id === catId) || { name: 'Unassigned', color: '#9CA3AF' };
  };

  const getUserName = (userId) => {
    const profile = profiles?.find(p => p.id === userId);
    return profile?.full_name || 'System User';
  };

  const isAdmin = role === 'admin';

  if (!expenses.length) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border text-gray-400">
        No records matched your specific filtration parameters.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-600 tracking-wider uppercase">
              <th className="p-4">Date</th>
              {isAdmin && <th className="p-4">User</th>}
              <th className="p-4">Title / Concept</th>
              <th className="p-4">Category</th>
              <th className="p-4">Mode</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm text-gray-700">
            {expenses.map((exp) => {
              const cat = getCategoryDetails(exp.category_id);
              return (
                <tr key={exp.id} className="hover:bg-gray-50/70 transition">
                  <td className="p-4 whitespace-nowrap">{formatDate(exp.date)}</td>
                  {isAdmin && (
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {getUserName(exp.user_id)}
                      </span>
                    </td>
                  )}
                  <td className="p-4 font-medium text-gray-900">
                    <div>{exp.title}</div>
                    {exp.notes && <span className="text-xs text-gray-400 block font-normal">{exp.notes}</span>}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: cat.color }}>
                      {cat.name}
                    </span>
                  </td>
                  <td className="p-4 uppercase text-xs tracking-wider text-gray-500 font-mono">{exp.payment_mode}</td>
                  <td className="p-4 text-right font-semibold text-gray-900">{formatCurrency(exp.amount)}</td>
                  <td className="p-4 text-center whitespace-nowrap space-x-2">
                    <button onClick={() => onEdit(exp)} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">Edit</button>
                    <button onClick={() => onDelete(exp.id)} className="text-red-600 hover:text-red-900 font-medium text-xs">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
