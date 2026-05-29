import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;
  const supabase = createServerClient();
  const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single();
  if (error || !data) return NextResponse.json({ success: false, message: 'Expense not found or access denied' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req, { params }) {
  const { id } = params;
  const supabase = createServerClient();
  const body = await req.json();

  const { data, error } = await supabase.from('expenses').update(body).eq('id', id).select();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json(data[0]);
}

export async function DELETE(req, { params }) {
  const { id } = params;
  const supabase = createServerClient();
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
