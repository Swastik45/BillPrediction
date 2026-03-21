import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername } from '@/lib/fakeDB';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ detail: 'Missing username or password' }, { status: 400 });
    }

    const user = findUserByUsername(username);
    if (!user || user.password !== password) {
      return NextResponse.json({ detail: 'Invalid username or password' }, { status: 401 });
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    return NextResponse.json({ detail: 'Could not login' }, { status: 500 });
  }
}
