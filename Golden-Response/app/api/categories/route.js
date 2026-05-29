import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if the user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Only admins can manage categories' }, { status: 403 });
    }

    const { name, color } = await req.json();
    const { data, error } = await supabase.from('categories').insert([{ user_id: user.id, name, color }]).select();
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
