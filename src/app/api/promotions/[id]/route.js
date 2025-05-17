// app/api/promotions/[id]/route.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export async function DELETE(request, { params }) {
  const { id } = params;
  console.log('🔥 Deleting promotion ID:', id);

  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM promotions WHERE id = $1 RETURNING *',
      [parseInt(id, 10)]
    );

    if (result.rowCount === 0) {
      console.warn('⚠️ Promotion not found in DB with ID:', id);
      return new Response(JSON.stringify({ success: false, error: 'Promotion not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true, deleted: result.rows[0] }), {
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error deleting promotion:', error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    });
  } finally {
    client.release();
  }
}
