import { NextRequest, NextResponse } from 'next/server';
import { predictBill, createHistoryItem } from '@/lib/fakeDB';

export async function POST(request: NextRequest) {
  try {
    const { units, user_id } = await request.json();
    const parsedUnits = Number(units);

    if (!Number.isFinite(parsedUnits) || parsedUnits <= 0) {
      return NextResponse.json({ detail: 'Invalid units value' }, { status: 400 });
    }

    const predicted_bill = predictBill(parsedUnits);
    createHistoryItem({ user_id: user_id != null ? Number(user_id) : null, units: parsedUnits, predicted_bill });

    return NextResponse.json({ predicted_bill });
  } catch (error) {
    return NextResponse.json({ detail: 'Prediction error' }, { status: 500 });
  }
}
