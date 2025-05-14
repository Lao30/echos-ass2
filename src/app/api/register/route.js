import { query } from '../../lib/db';

const bcrypt = require('bcryptjs');



export async function POST(request) {
  try {
    const { fullName, email, phone, userId, password, role } = await request.json();

    // Validate required fields
    if (!fullName || !email || !userId || !password || !role || !phone) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      

    // Check if user already exists
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1 OR user_id = $2',
      [email, userId]
    );

    if (existingUser.rows.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Email or User ID already exists' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const result = await query(
        `INSERT INTO users 
         (full_name, email, phone_number, user_id, password, role) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING user_id, full_name, email, role`,
        [fullName, email, phone, userId, passwordHash, role]
      );
      

    const newUser = result.rows[0];

    return new Response(JSON.stringify({ 
      success: true, 
      user: newUser 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}