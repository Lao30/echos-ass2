import { query } from '../../lib/db';

export async function DELETE(request) {
  try {

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'User ID is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await query(
      'DELETE FROM users WHERE user_id = $1 RETURNING *',
      [userId]
    );

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ 
        error: 'User not found'
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      deletedUser: result.rows[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Database Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal menghapus user',
      detail: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}