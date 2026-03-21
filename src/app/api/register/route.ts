import { NextRequest, NextResponse } from 'next/server';
import { createUserWithAuth } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, full_name } = await request.json();

    if (!username || !email || !password || !full_name) {
      return NextResponse.json({ detail: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ detail: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const user = await createUserWithAuth(email, password, { username, full_name });

    // Return user data without sensitive information
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ detail: message }, { status: 400 });
  }
}
