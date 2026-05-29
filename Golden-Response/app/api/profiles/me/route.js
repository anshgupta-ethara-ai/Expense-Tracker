import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Self-healing: create profile if missing
      const fullName = user.user_metadata?.full_name || 'User';
      const role = user.user_metadata?.role || 'member';

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, full_name: fullName, role }])
        .select('id, full_name, role')
        .single();

      if (insertError) {
        console.error("Error creating default profile:", insertError);
        // Fallback to in-memory profile representation from JWT metadata
        profile = { id: user.id, full_name: fullName, role };
      } else {
        profile = newProfile;
      }
    }

    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
