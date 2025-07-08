const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// 🔐 Middleware: Verify JWT Token
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from DB to confirm identity and fetch role
    const result = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    // Attach user info to request
    req.user = {
      id: result.rows[0].id,
      role: result.rows[0].role,
    };

    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

// 🔒 Middleware: Role-Based Access Control
exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
};
