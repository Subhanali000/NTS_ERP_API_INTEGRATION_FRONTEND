const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.ivsvlcdqlxhbozufkjia.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '', 
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to Supabase PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

module.exports = pool;
