import { NextRequest, NextResponse } from 'next/server';
import { getHistory, clearHistory } from '@/lib/fakeDB';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const user_id = userId ? Number(userId) : null;
    const data = getHistory(user_id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ detail: 'Unable to get history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const user_id = userId ? Number(userId) : null;
    clearHistory(user_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ detail: 'Unable to clear history' }, { status: 500 });
  }
}
