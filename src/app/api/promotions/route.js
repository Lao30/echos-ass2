// pages/api/promotions/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export async function POST(req) {
    try {
      const payload = await req.json();
      if (!payload.promo_code || !payload.discount_amount || !payload.valid_until) {
        return NextResponse.json(
          { success: false, error: "Please fill in all required fields" },
          { status: 400 }
        );
      }
  
      const { promo_code, discount_type, discount_amount, valid_until, event_id } = payload;
  
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO promotions (promo_code, discount_type, discount_amount, valid_until, event_id)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [promo_code, discount_type, discount_amount, valid_until, event_id]
        );
        console.log("✅ Promotion created:", result.rows[0]);
        return NextResponse.json({ success: true, promotion: result.rows[0] });
      } catch (error) {
        console.error("❌ Query failed:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("❌ Error creating promotion:", error.message);
      
      // Log the response body if it's not JSON
      if (error.response && error.response.text) {
        console.error("Error response body:", error.response.text);
      }
  
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }
  export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ success: false, error: "Missing eventId" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM promotions WHERE event_id = $1`,
        [eventId]
      );
      return NextResponse.json({ success: true, promotions: result.rows });
    } catch (error) {
      console.error("❌ Query failed:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error loading promotions:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}



  