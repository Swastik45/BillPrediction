import { NextRequest, NextResponse } from 'next/server';
import { createPrediction } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { units, user_id } = await request.json();
    const parsedUnits = Number(units);

    if (!Number.isFinite(parsedUnits) || parsedUnits <= 0) {
      return NextResponse.json({ detail: 'Invalid units value' }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ detail: 'User ID is required' }, { status: 400 });
    }

    const prediction = await createPrediction(user_id, parsedUnits);

    return NextResponse.json({ predicted_bill: prediction.predicted_bill });
  } catch (error) {
    console.error('Prediction error:', error);
    const message = error instanceof Error ? error.message : 'Prediction failed';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
