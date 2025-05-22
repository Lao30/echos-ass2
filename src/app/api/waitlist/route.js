// app/api/waitlist/route.js
import { NextResponse } from "next/server";
import { pool } from "../../lib/db";

// POST: add someone to waitlist
export async function POST(req) {
  try {
    const { event_id, event_name, user_name, user_email } = await req.json();
    if (!event_id || !event_name || !user_name || !user_email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO waitlists (event_id, event_name, user_name, user_email)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [event_id, event_name, user_name, user_email];
    const { rows } = await pool.query(sql, values);

    return NextResponse.json({
      success: true,
      entry: rows[0],
    });
  } catch (err) {
    console.error("Error adding to waitlist:", err);
    return NextResponse.json(
      { success: false, error: "Server error: " + err.message },
      { status: 500 }
    );
  }
}

// GET: list all waitlist entries (optionally filter by event_id)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("event_id");

    let sql = "SELECT * FROM waitlists";
    const params = [];
    if (eventId) {
      sql += " WHERE event_id = $1";
      params.push(eventId);
    }
    sql += " ORDER BY created_at DESC";

    const { rows } = await pool.query(sql, params);
    return NextResponse.json({ success: true, entries: rows });
  } catch (err) {
    console.error("Error fetching waitlist:", err);
    return NextResponse.json(
      { success: false, error: "Server error: " + err.message },
      { status: 500 }
    );
  }
}
