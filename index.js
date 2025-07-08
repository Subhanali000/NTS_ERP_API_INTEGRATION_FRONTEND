require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const managerRoutes = require('./routes/managerRoutes');
const directorRoutes = require('./routes/directorRoutes');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`\n[${now}] ${req.method} ${req.originalUrl}`);
  console.log(`📦 Content-Type: ${req.headers['content-type'] || 'Not Provided'}`);

  // Log Authorization token if present
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    console.log(`🔐 Authorization: ${authHeader}`);
  } else {
    console.log('🔐 Authorization: None');
  }

  // Log request body for modifying methods
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('🧾 Request Body:', req.body);
  }

  // If this is the login route, log login-specific info
  if (req.method === 'POST' && req.originalUrl.includes('/auth/login')) {
    const email = req.body?.email || 'N/A';
    const role = req.body?.role || 'Unknown (may not be provided yet)';
    console.log(`👤 Login Attempt - Email: ${email}, Role: ${role}`);
  }

  next();
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/director', directorRoutes);

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

async function checkDatabaseConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('🟢 PostgreSQL connected at:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed!');
    console.error('📛 Error message:', err.message);
    console.error('📛 Full error:', err);
  }
}


// Start server
app.listen(PORT, async () => {
  console.log('\n🚀 Starting NTS ERP Backend Server...');
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth Endpoint: http://localhost:${PORT}/api/auth`);
  
  await checkDatabaseConnection(); // ⏳ Test DB connection
});

module.exports = app;