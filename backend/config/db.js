// ============================================
// PostgreSQL Connection Pool
// ============================================
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_task_manager',
  max: 20,                    // maximum pool size
  idleTimeoutMillis: 30000,   // close idle clients after 30s
  connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL connected successfully'))
  .catch((err) => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  });

// Log pool errors
pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

module.exports = pool;
