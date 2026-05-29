'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [hasSession, setHasSession] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      if (session) {
        // Optimistically display role from metadata to prevent blank states
        const metaRole = session.user?.user_metadata?.role || 'member';
        setRole(metaRole);

        try {
          const res = await fetch('/api/profiles/me');
          if (res.ok) {
            const profile = await res.json();
            setRole(profile?.role || metaRole);
          }
        } catch (err) {
          console.error("Error fetching role:", err);
        }
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
      if (!session) setRole(null);
      else fetchSession();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (!hasSession) return null;

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/expenses', label: 'Expenses' },
    { href: '/categories', label: 'Categories' },
    { href: '/budgets', label: 'Budgets' },
    { href: '/reports', label: 'Reports' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-bold text-lg tracking-tight text-indigo-600">SpendWise</span>
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={`text-sm font-medium px-3 py-2 rounded-lg transition ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {role && (
            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
              {role}
            </span>
          )}
          <button onClick={handleSignOut} className="text-sm font-medium text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
