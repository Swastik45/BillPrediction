import { NextRequest, NextResponse } from 'next/server';
import { deleteHistoryItem } from '@/lib/fakeDB';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return NextResponse.json({ detail: 'Invalid item ID' }, { status: 400 });
    }
    const removed = deleteHistoryItem(parsedId);
    if (!removed) {
      return NextResponse.json({ detail: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ detail: 'Unable to delete item' }, { status: 500 });
  }
}
