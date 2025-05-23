import { query } from '../../../lib/db';

export async function GET() {
  try {
    // Total Event Organizers
    const totalOrganizers = await query(
      `SELECT COUNT(user_id) AS count 
       FROM users 
       WHERE role = 'Event Organizer'`
    );

    // Monthly Organizer Growth
    const monthlyGrowth = await query(
      `SELECT 
         TO_CHAR(created_at, 'YYYY-MM') AS month,
         COUNT(user_id) AS new_organizers
       FROM users
       WHERE role = 'Event Organizer'
       GROUP BY month
       ORDER BY month ASC`
    );

    return new Response(JSON.stringify({
      success: true,
      data: {
        total: Number(totalOrganizers.rows[0].count),
        growth: monthlyGrowth.rows.map(row => ({
          month: row.month,
          count: Number(row.new_organizers)
        }))
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Database Error',
      detail: process.env.NODE_ENV === 'development' ? error.message : null
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
