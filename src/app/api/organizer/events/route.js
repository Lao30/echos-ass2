// app/api/organizer/events/route.js
import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function GET(request) {
  // We’ll read the organizer’s user_id from a query param or (better) from a session.
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Missing user_id" },
      { status: 400 }
    );
  }

  try {
    const sql = `
      SELECT id, event_name
      FROM events
      WHERE user_id = $1
      ORDER BY event_date DESC
    `;
    const { rows } = await pool.query(sql, [userId]);
    return NextResponse.json({ success: true, events: rows });
  } catch (err) {
    console.error("Error loading organizer events:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
