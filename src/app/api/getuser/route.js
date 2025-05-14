import { query } from '../../lib/db';

export async function GET() {
  try {
    // Ambil semua user dengan role event_organizer
    const result = await query(
      'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC',
      ['Event Organizer']
    );

    return new Response(JSON.stringify({ 
      users: result.rows 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Database Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch users' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

    
  }
  
}

