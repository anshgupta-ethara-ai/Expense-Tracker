import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url.includes('your-supabase-project')) {
    console.error('Supabase URL is not configured correctly in .env.local');
  }

  return createBrowserClient(url, key);
};
