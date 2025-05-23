// app/api/seats/reserved/route.js
import { NextResponse } from "next/server";
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `SELECT seat FROM orders WHERE event_id = $1`,
      [eventId]
    );
    const reserved = rows.map((r) => r.seat);
    return NextResponse.json({ reserved });
  } catch (err) {
    console.error("Error fetching reserved seats:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


