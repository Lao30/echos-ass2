import { query } from '../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fullName, email, phone, userId, password, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !userId || !password || !role || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      

    // Check if user already exists
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1 OR user_id = $2',
      [email, userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email or User ID already exists' });
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

    return res.status(201).json({ success: true, user: newUser });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
