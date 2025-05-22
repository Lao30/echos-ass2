import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

export async function POST(request, { params }) {
  const eventId = parseInt(params.id, 10);
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ success: false, message: 'Invalid Event ID' }, { status: 400 });
  }

  const { amount, seats, name, email } = await request.json();
  if (!amount || !seats?.length || !name || !email) {
    return NextResponse.json({ success: false, message: 'Missing payment data' }, { status: 400 });
  }

  try {
    
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });


    const chargePayload = {
      transaction_details: {
        order_id: `EVT-${eventId}-${Date.now()}`,
        gross_amount: amount,
      },
      customer_details: { first_name: name, email },
      item_details: seats.map(s => ({
        id: s.id,
        price: s.price,
        quantity: 1,
        name: `Seat ${s.id}`
      })),
    };

    const snapResponse = await snap.createTransaction(chargePayload);

   
    return NextResponse.json({ success: true, token: snapResponse.token });
  } catch (err) {
    console.error('Payment error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
