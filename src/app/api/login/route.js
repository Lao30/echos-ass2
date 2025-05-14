import { query } from '../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();
    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email, role]
    );
    const user = result.rows[0];
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid email or role' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: 'Incorrect password' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
      phone_number: user.phone_number
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}