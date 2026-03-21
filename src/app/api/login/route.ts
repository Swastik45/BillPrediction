import { NextRequest, NextResponse } from 'next/server';
import { signInUser } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ detail: 'Username and password are required' }, { status: 400 });
    }

    // For Supabase, we need email, not username
    // We'll need to look up the email by username first
    const user = await signInUser(username, password);

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ detail: message }, { status: 401 });
  }
}
