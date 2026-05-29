import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || 'member';

    if (role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Only admins can update budgets' }, { status: 403 });
    }

    const { amount_limit } = await req.json();
    const { data, error } = await supabase.from('budgets').update({ amount_limit }).eq('id', id).select();
    
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
