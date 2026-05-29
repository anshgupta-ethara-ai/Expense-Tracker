import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // Fetch all budgets directly (since only Admins can create them under RLS, all rows are admin-set)
    const { data, error } = await supabase.from('budgets').select('*');

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || 'member';

    if (role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Only admins can set budgets' }, { status: 403 });
    }

    const { category_id, month, amount_limit } = await req.json();

    const { data, error } = await supabase.from('budgets').insert([{ 
      user_id: user.id, 
      category_id, 
      month, 
      amount_limit 
    }]).select();

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
