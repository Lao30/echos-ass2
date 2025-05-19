// GET seat sections + harga
import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/db';

export async function GET(request, { params }) {
  const eventId = parseInt(params.id, 10);
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ success: false, message: 'Invalid Event ID' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `SELECT id, section_name AS name, capacity, price
       FROM seat_sections
       WHERE event_id = $1`,
      [eventId]
    );
    return NextResponse.json({ success: true, sections: result.rows });
  } catch (err) {
    console.error('GET tickets error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
