import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ detail: 'Email is required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: 'https://vercel.com/psamarpaudel-4220s-projects/bill-prediction'
      }
    });

    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Confirmation email sent successfully' });
  } catch (error) {
    console.error('Resend confirmation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to resend confirmation';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}