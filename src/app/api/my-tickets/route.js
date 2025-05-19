// app/api/my-tickets/route.js
import { NextResponse } from "next/server";
import { pool } from "../../lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { success: false, error: "Missing email in URL" },
      { status: 400 }
    );
  }

  try {
    const sql = `
      SELECT
        o.id,
        o.email,
        o.event_id,
        e.event_name,
        e.event_date,
        e.start_time,
        e.end_time,
        e.venue,
        e.category,
        o.seat,
        o.amount,
        o.created_at AS purchased_at
      FROM orders o
      JOIN events e ON e.id = o.event_id
      WHERE o.email = $1
      ORDER BY o.created_at DESC
    `;
    const { rows } = await pool.query(sql, [email]);
    return NextResponse.json({ success: true, tickets: rows }, { status: 200 });
  } catch (err) {
    console.error("Error loading tickets:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
