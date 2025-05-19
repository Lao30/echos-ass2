// app/api/events/[id]/analytics/route.js
import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";

export async function GET(request, { params }) {
  const { id: eventId } = params;
  try {
    const sql = `
      SELECT 
        COUNT(*)     AS count,
        COALESCE(SUM(amount), 0) AS revenue
      FROM orders
      WHERE event_id = $1
    `;
    const { rows } = await pool.query(sql, [eventId]);
    return NextResponse.json({
      success: true,
      count: Number(rows[0].count),
      revenue: Number(rows[0].revenue),
    });
  } catch (err) {
    console.error("Error loading analytics:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
