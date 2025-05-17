// app/api/events/route.js
import { NextResponse } from 'next/server';
import { pool } from '../../lib/db';  // Use your shared pool instance

// POST: Create event (including user_id, email, category)
export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Received body:', body);

    const {
      user_id,
      email,
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
    if (
      !user_id ||
      !email ||
      !event_name ||
      !event_date ||
      !start_time ||
      !end_time ||
      !venue
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO events (
        user_id,
        email,
        event_name,
        description,
        event_date,
        start_time,
        end_time,
        venue,
        banner_url,
        category
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;
    const values = [
      user_id,
      email,
      event_name,
      description,
      event_date,
      start_time,
      end_time,
      venue,
      banner_url,
      category,
    ];

    const { rows } = await pool.query(sql, values);
    return NextResponse.json({ success: true, event: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Error creating event:', err);
    return NextResponse.json(
      { success: false, error: 'Server error: ' + err.message },
      { status: 500 }
    );
  }
}

// GET: Fetch events, optionally filtered by user_id or email
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const email  = searchParams.get('email');

    let sql = 'SELECT * FROM events';
    const params = [];

    if (userId) {
      sql += ' WHERE user_id = $1';
      params.push(userId);
    } else if (email) {
      sql += ' WHERE email = $1';
      params.push(email);
    }

    sql += ' ORDER BY event_date DESC';

    const { rows } = await pool.query(sql, params);
    return NextResponse.json({ success: true, events: rows }, { status: 200 });
  } catch (err) {
    console.error('Error fetching events:', err);
    return NextResponse.json(
      { success: false, error: 'Server error: ' + err.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete event by ID
export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Event ID' },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, deletedEvent: rows[0] },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error deleting event:', err);
    return NextResponse.json(
      { success: false, error: 'Server error: ' + err.message },
      { status: 500 }
    );
  }
}
