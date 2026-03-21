import { NextRequest, NextResponse } from 'next/server';
import { deletePrediction } from '@/lib/database';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user_id } = await request.json();

    if (!id) {
      return NextResponse.json({ detail: 'Prediction ID is required' }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ detail: 'User ID is required' }, { status: 400 });
    }

    await deletePrediction(id, user_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete prediction error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete prediction';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
