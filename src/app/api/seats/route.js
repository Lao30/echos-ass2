// app/api/seats/route.js
import { NextResponse } from "next/server";
import { pool } from "../../lib/db";

export async function POST(request) {
  try {
    const { event_id, section, seat_number, email, amount } = await request.json();

    // validasi
    if (
      event_id == null ||
      !section ||
      seat_number == null ||
      !email ||
      amount == null
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const seatCode = `${seat_number}${section}`;

    // cek duplikat
    const exists = await pool.query(
      "SELECT 1 FROM orders WHERE event_id = $1 AND seat = $2",
      [event_id, seatCode]
    );
    if (exists.rowCount > 0) {
      return NextResponse.json(
        { error: "Seat already reserved" },
        { status: 409 }
      );
    }

    // INSERT dengan amount sesungguhnya
    const { rows } = await pool.query(
      `INSERT INTO orders (email, event_id, seat, amount, created_at)
       VALUES ($1,$2,$3,$4, NOW())
       RETURNING *`,
      [email, event_id, seatCode, amount]
    );

    return NextResponse.json(
      { success: true, reservation: rows[0] },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in /api/seats POST:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


