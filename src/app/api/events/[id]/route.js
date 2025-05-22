// app/api/events/[id]/route.js
import { NextResponse } from 'next/server';
import { pool } from '../../../lib/db';

// GET single event details
export async function GET(request, { params }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid Event ID' },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      `SELECT 
         id,
         event_name AS title,
         description,
         event_date AS date,
         start_time AS time,
         end_time,
         venue,
         banner_url AS image,
         category,
         created_at,
         updated_at
       FROM events
       WHERE id = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }
    const event = result.rows[0];
    return NextResponse.json({ success: true, event });
  } catch (err) {
    console.error('GET event error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + err.message },
      { status: 500 }
    );
  }
}

// DELETE event
export async function DELETE(request, { params }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid Event ID' },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Hapus data terkait di tabel orders dan waitlists
    await client.query('DELETE FROM orders WHERE event_id = $1', [id]);
    await client.query('DELETE FROM waitlists WHERE event_id = $1', [id]);

    // Hapus event utama
    const result = await client.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    await client.query('COMMIT');
    return NextResponse.json(
      { success: true, message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + err.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// PUT update event
export async function PUT(request, { params }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid Event ID' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const {
      event_name,
      description,
      event_date,
      start_time,
      end_time,
      venue,
      banner_url,
      category,
    } = body;

    // Validate required fields
    if (!event_name || !event_date || !start_time || !end_time || !venue) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updateSQL = `
      UPDATE events SET
        event_name = $1,
        description = $2,
        event_date = $3,
        start_time = $4,
        end_time = $5,
        venue = $6,
        banner_url = $7,
        category   = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *;
    `;
    const values = [
      event_name,
      description,
      event_date,
      start_time,
      end_time,
      venue,
      banner_url,
      category,
      id,
    ];

    const result = await pool.query(updateSQL, values);
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, event: result.rows[0] },
      { status: 200 }
    );
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + err.message },
      { status: 500 }
    );
  }
}
