// src/app/api/myadmin/route.js
import { query } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function POST(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    const body = await request.json();
    const { fullName, email, phone, password } = body;

    // Validasi input
    const requiredFields = ['fullName', 'email', 'phone', 'password'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return new Response(JSON.stringify({ 
        error: `Field yang dibutuhkan: ${missingFields.join(', ')}` 
      }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Generate UUID
    const userId = randomUUID(); // Generate UUID v4

    // Cek email sudah terdaftar
    const existingUser = await query(
      'SELECT email FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Email sudah terdaftar' 
      }), { 
        status: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert to database
    const result = await query(
      `INSERT INTO users 
        (user_id, full_name, email, password, phone_number, role) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING user_id, full_name, email, phone_number, role, created_at`,
      [userId, fullName, email, hashedPassword, phone, 'Event Organizer'] // <-- Pastikan nilai role benar
    );

    return new Response(JSON.stringify({
      success: true,
      user: result.rows[0]
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('ERROR DETAIL:', {
      message: error.message,
      stack: error.stack,
      query: error.query || 'N/A'
    });
    
    return new Response(JSON.stringify({ 
      error: 'Database Error',
      detail: process.env.NODE_ENV === 'development' 
        ? error.message 
        : null
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}