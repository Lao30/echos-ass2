// File: pages/api/events/[id]/payments.js

import midtransClient from 'midtrans-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { amount, seats, name, email } = req.body;

  if (!amount || !name || !email || !Array.isArray(seats)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    // Midtrans setup
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        gross_amount: amount,
      },
      customer_details: {
        first_name: name,
        email: email,
      },
      item_details: seats.map((seat, index) => ({
        id: `seat-${index + 1}`,
        price: seat.price,
        quantity: 1,
        name: `Seat ${seat.id}`,
      })),
    };

    const transaction = await snap.createTransaction(parameter);
    res.status(200).json({ token: transaction.token });
  } catch (error) {
    console.error("Midtrans Error:", error);
    res.status(500).json({ message: "Midtrans transaction failed" });
  }
}
