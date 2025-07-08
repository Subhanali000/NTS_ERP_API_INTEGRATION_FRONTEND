const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ⬇ Signup inserts into BOTH `users` and `directors`
exports.signupDirector = async (req, res) => {
  const {
    email,
    password_hash,
    name,
    phone,
    doj,
    designation,
    department,
    director_title,
    emergency_contact_name,
    emergency_contact_phone
  } = req.body;

  const requiredFields = {
    email, password_hash, name, doj, designation,
    department, director_title, emergency_contact_name, emergency_contact_phone
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({ error: `Missing required field: ${key}` });
    }
  }

  try {
    // Check if email already exists in `users`
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password_hash, 10);

    // Step 1: Insert into `users` table
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
      [email, hashedPassword, director_title]
    );
    const userId = userResult.rows[0].id;

    // Step 2: Insert into `directors` table
    await pool.query(
      `INSERT INTO directors 
        (user_id, name, phone, join_date, designation, department, emergency_contact_name, emergency_contact_phone)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, name, phone, doj, designation, department, emergency_contact_name, emergency_contact_phone]
    );

    // Step 3: Generate JWT
    const token = jwt.sign({ id: userId, role: director_title }, process.env.JWT_SECRET || 'default-secret');

    res.status(201).json({ token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Fetch user by email from unified `users` table
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // 2. Compare password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // 3. Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '1h' }
    );

    // 4. Absolute profile URL if available
    let profileUrl = user.profile_url;
    if (profileUrl && !profileUrl.startsWith('http')) {
      profileUrl = `${req.protocol}://${req.get('host')}${profileUrl}`;
    }

    // 5. Respond with user info and token
    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        manager_id: user.manager_id,
        profile_url: profileUrl
      },
      token
    });

  } catch (error) {
    console.error('🔥 Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
