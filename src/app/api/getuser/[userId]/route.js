import { query } from '../../../lib/db';

export async function GET(request, { params }) {
  try {
    const { userId } = params;
    
    const result = await query(
      'SELECT user_id, full_name, email, role FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'User tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ user: result.rows[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}