const { Pool } = require('pg');
const env = require('./env');

// PostgreSQL connection pool
const pool = new Pool({
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
});

// Helper function to query the database
const query = (text, params) => pool.query(text, params);

// Initialize tables on application startup
const initDb = async () => {
  try {
    // 1. Ensure database exists
    const adminPool = new Pool({
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: 'postgres',
    });

    try {
      const checkRes = await adminPool.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [env.DB_NAME]
      );

      if (checkRes.rows.length === 0) {
        await adminPool.query(`CREATE DATABASE ${env.DB_NAME}`);
        console.log(`[Database]: Created PostgreSQL database "${env.DB_NAME}"`);
      }
    } catch (checkErr) {
      console.warn(`[Database Notice]: Admin pool check: ${checkErr.message}`);
    } finally {
      await adminPool.end();
    }

    // 2. Initialize 'users' table
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'ATTENDEE' CHECK (role IN ('ATTENDEE', 'ORGANIZER', 'ADMIN')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createUsersTableQuery);

    // 3. Initialize 'events' table
    const createEventsTableQuery = `
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        organizer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'Technology',
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        location VARCHAR(255) NOT NULL,
        venue VARCHAR(255) NOT NULL,
        ticket_price NUMERIC(10, 2) DEFAULT 0.00,
        total_capacity INTEGER NOT NULL,
        registered_count INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createEventsTableQuery);

    // 4. Initialize 'passes' table
    const createPassesTableQuery = `
      CREATE TABLE IF NOT EXISTS passes (
        id SERIAL PRIMARY KEY,
        pass_code VARCHAR(100) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'CANCELLED')),
        qr_code_data TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      );
    `;
    await pool.query(createPassesTableQuery);

    console.log('[Database]: PostgreSQL connected & "users", "events", "passes" tables ready.');
  } catch (error) {
    console.error('[Database Error]: Failed to initialize database:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  initDb,
};
