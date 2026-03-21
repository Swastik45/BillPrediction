import { NextRequest, NextResponse } from 'next/server';
import { createPrediction } from '@/lib/database';
import { predictBill } from '@/lib/fakeDB'; // For guest predictions

export async function POST(request: NextRequest) {
  try {
    const { units, user_id } = await request.json();
    const parsedUnits = Number(units);

    if (!Number.isFinite(parsedUnits) || parsedUnits <= 0) {
      return NextResponse.json({ detail: 'Invalid units value' }, { status: 400 });
    }

    let predicted_bill;

    if (user_id) {
      // Logged-in user: store in database
      const prediction = await createPrediction(user_id, parsedUnits);
      predicted_bill = prediction.predicted_bill;
    } else {
      // Guest user: don't store in database, just calculate
      predicted_bill = predictBill(parsedUnits);
    }

    return NextResponse.json({ predicted_bill });
  } catch (error) {
    console.error('Prediction error:', error);
    const message = error instanceof Error ? error.message : 'Prediction failed';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
