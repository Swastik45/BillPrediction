import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername, createUser } from '@/lib/fakeDB';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, full_name } = await request.json();

    if (!username || !email || !password || !full_name) {
      return NextResponse.json({ detail: 'Missing fields' }, { status: 400 });
    }

    if (findUserByUsername(username)) {
      return NextResponse.json({ detail: 'Username already exists' }, { status: 409 });
    }

    const newUser = createUser({ username, email, password, full_name });

    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      full_name: newUser.full_name,
      created_at: newUser.created_at,
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    return NextResponse.json({ detail: 'Could not register' }, { status: 500 });
  }
}
