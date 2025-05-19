// app/api/events/[id]/purchases/route.js
import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";

export async function GET(request, { params }) {
  const { id: eventId } = params;

  try {
    // Only select columns that actually exist in `orders`
     const sql = `
      SELECT
        COALESCE(email, '') AS "userEmail",  -- safely handle NULL
        amount,
        seat,
        created_at AS "purchasedAt"
      FROM orders
      WHERE event_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(sql, [eventId]);
    return NextResponse.json({ success: true, purchases: rows });
  } catch (err) {
    console.error("Error loading purchases:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
