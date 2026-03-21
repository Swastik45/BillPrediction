import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, full_name } = await request.json();

    if (!username || !email || !password || !full_name) {
      return NextResponse.json({ detail: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ detail: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // First check if username is taken
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json({ detail: 'Username already exists' }, { status: 400 });
    }

    // Check if email is already registered
    const { data: existingEmail } = await supabase.auth.admin.listUsers();
    const emailExists = existingEmail.users.some(user => user.email === email);
    if (emailExists) {
      return NextResponse.json({ detail: 'Email already registered' }, { status: 400 });
    }

    // Create auth user with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name,
        },
        emailRedirectTo: 'https://vercel.com/psamarpaudel-4220s-projects/bill-prediction'
      }
    });

    if (authError) {
      return NextResponse.json({ detail: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ detail: 'Failed to create user' }, { status: 400 });
    }

    // Don't create profile yet - wait for email confirmation
    return NextResponse.json({
      message: 'Registration successful. Please check your email to confirm your account.',
      email: authData.user.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ detail: message }, { status: 400 });
  }
}
