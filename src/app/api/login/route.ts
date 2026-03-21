import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ detail: 'Username and password are required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Check if identifier is email or username
    let email = username;
    if (!username.includes('@')) {
      // It's a username, look up the email
      const { data: userProfile, error: lookupError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();

      if (lookupError || !userProfile) {
        // Check if there's an unconfirmed user with this username
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUser = authUsers.users.find(user =>
          user.user_metadata?.username === username && !user.email_confirmed_at
        );
        if (authUser) {
          return NextResponse.json({
            detail: 'Email not confirmed. Please check your email and confirm your account.',
            needsConfirmation: true,
            email: authUser.email
          }, { status: 401 });
        }
        return NextResponse.json({ detail: 'Invalid username or password' }, { status: 401 });
      }
      email = userProfile.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed') || error.message.includes('not confirmed')) {
        return NextResponse.json({
          detail: 'Email not confirmed. Please check your email and confirm your account.',
          needsConfirmation: true,
          email
        }, { status: 401 });
      }
      return NextResponse.json({ detail: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
    }

    // Check if user profile exists, if not create it
    let { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') { // Not found
      // Create profile now that user is confirmed
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          username: data.user.user_metadata?.username || username,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || '',
        })
        .select()
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        return NextResponse.json({ detail: 'Failed to create user profile' }, { status: 500 });
      }
      profile = newProfile;
    } else if (profileError) {
      return NextResponse.json({ detail: 'User profile error' }, { status: 500 });
    }

    const safeUser = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      full_name: profile.full_name,
      created_at: profile.created_at,
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ detail: message }, { status: 401 });
  }
}
