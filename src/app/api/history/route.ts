import { NextRequest, NextResponse } from 'next/server';
import { getUserPredictions, getAllPredictions, clearUserPredictions } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    let data: any[] = [];
    if (userId) {
      data = await getUserPredictions(userId);
    } else {
      // Guest users should not see any historical data for security
      data = [];
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('History fetch error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch history';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ detail: 'User ID is required' }, { status: 400 });
    }

    await clearUserPredictions(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('History clear error:', error);
    const message = error instanceof Error ? error.message : 'Failed to clear history';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
