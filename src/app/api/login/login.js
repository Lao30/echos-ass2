// pages/api/login.js
import { query } from '../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, password, role } = req.body;

    if (!userId || !password || !role) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    // Find user by userId
    const result = await query(
      'SELECT * FROM users WHERE user_id = $1 AND role = $2',
      [userId, role]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid user ID or role' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Optionally return user data (avoid sending password)
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
