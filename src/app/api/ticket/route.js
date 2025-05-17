import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export async function POST(req) {
  try {
    const payload = await req.json();
    console.log("📦 Payload received:", JSON.stringify(payload, null, 2));

    if (!payload.eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const { sections = [], eventId, deletedSectionIds = [] } = payload;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Delete old sections
      if (deletedSectionIds.length > 0) {
        console.log("🔴 Deleting sections:", deletedSectionIds);

        const deleteQuery = `
          DELETE FROM ticket_sections
          WHERE id = ANY($1::int[]) 
          AND event_id = $2
          RETURNING *`;

        const deleteResult = await client.query(deleteQuery, [
          deletedSectionIds,
          parseInt(eventId)
        ]);

        console.log(`🗑️ Deleted ${deleteResult.rowCount} sections`);

        if (deleteResult.rowCount === 0) {
          console.error("❌ No sections were deleted.");
          return NextResponse.json({
            success: false,
            error: "No sections found to delete or sections do not belong to the specified event."
          }, { status: 404 });
        }
      }

      // 2. Insert/update sections (if any)
      const operations = sections.map(section => {
        const baseParams = [
          section.name,
          section.type,
          parseInt(section.capacity) || 0,
          parseFloat(section.price) || 0,
          parseInt(eventId)
        ];

        if (section.id) {
          return client.query(
            `UPDATE ticket_sections SET
              section_name = $1,
              section_type = $2,
              capacity = $3,
              price = $4
             WHERE id = $5 AND event_id = $6
             RETURNING *`,
            [...baseParams, parseInt(section.id)]
          );
        }

        return client.query(
          `INSERT INTO ticket_sections 
           (section_name, section_type, capacity, price, event_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          baseParams
        );
      });

      const results = await Promise.all(operations);
      const savedSections = results.flatMap(r => r.rows);

      await client.query('COMMIT');
      console.log("✅ Transaction committed successfully");

      return NextResponse.json({
        success: true,
        sections: savedSections.map(section => ({
          ...section,
          id: section.id.toString()
        }))
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error("❌ Transaction error:", err.message, err.stack);
      return NextResponse.json(
        { success: false, error: `Database error: ${err.message}` },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("🔥 Top-level error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `SELECT 
        id::text as id, 
        section_name as name, 
        section_type as type, 
        capacity, 
        price 
       FROM ticket_sections 
       WHERE event_id = $1 
       ORDER BY created_at`,
      [parseInt(eventId)]
    );

    return NextResponse.json({ success: true, sections: rows });
  } catch (err) {
    console.error("❌ GET error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
