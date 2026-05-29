import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Force select all if admin, otherwise filter by user_id
    let query = supabase.from('expenses').select('*');
    
    if (profile?.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.order('date', { ascending: false });
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error processing action' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = createServerClient();
    const body = await req.json();
    const { title, amount, category_id, date, payment_mode, notes, receipt_url } = body;

    if (!title || !amount || amount <= 0 || !category_id || !date || !payment_mode) {
      return NextResponse.json({ success: false, message: 'Validation rule violation' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('expenses').insert([{
      user_id: user.id, title, amount, category_id, date, payment_mode, notes, receipt_url
    }]).select();

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server Failure' }, { status: 500 });
  }
}
