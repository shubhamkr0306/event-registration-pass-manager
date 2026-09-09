const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const env = require('./env');

const isProduction = env.NODE_ENV === 'production' || !!process.env.RENDER;

// Create connection pool: supports single DATABASE_URL (used on Render/Cloud) or individual env variables
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

// Helper function to query the database
const query = (text, params) => pool.query(text, params);

// Auto-seed initial demo accounts and starter events if the database is fresh/empty
const autoSeedIfEmpty = async () => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count, 10) === 0) {
      console.log('[Database]: Fresh database detected. Auto-seeding initial demo data...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      // 1. Create demo users (Admin, Organizer, Attendee)
      const orgRes = await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ('Shubham Kumar', 'organizer@shnoor.com', $1, 'ORGANIZER') 
         RETURNING id`,
        [hashedPassword]
      );
      const organizerId = orgRes.rows[0].id;

      await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ('System Admin', 'admin@shnoor.com', $1, 'ADMIN')`,
        [hashedPassword]
      );

      await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ('Aarav Patel (Attendee)', 'attendee@shnoor.com', $1, 'ATTENDEE')`,
        [hashedPassword]
      );

      // 2. Create sample events
      const sampleEvents = [
        {
          title: 'Global AI & Cloud Summit 2026',
          description: 'Annual summit gathering cloud architects and AI engineers.',
          category: 'Technology',
          date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Bangalore, India',
          venue: 'Grand Tech Convention Centre, Hall A',
          ticket_price: 499.00,
          total_capacity: 200,
          registered_count: 144,
          status: 'ACTIVE',
        },
        {
          title: 'Cloud DevOps Workshop 2026',
          description: 'Hands-on workshop on CI/CD pipelines, Kubernetes, and Terraform.',
          category: 'Workshop',
          date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Pune, India',
          venue: 'Tech Hub Floor 2',
          ticket_price: 199.00,
          total_capacity: 50,
          registered_count: 1,
          status: 'UPCOMING',
        },
        {
          title: 'NextGen Full-Stack & DevOps Conference',
          description: 'Deep dive technical sessions on modern web architecture.',
          category: 'Development',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Hyderabad, India',
          venue: 'Cyber City Auditorium, Sector 4',
          ticket_price: 299.00,
          total_capacity: 150,
          registered_count: 66,
          status: 'UPCOMING',
        },
        {
          title: 'Cybersecurity & Zero Trust Expo',
          description: 'Identity security, posture management, and cloud defenses.',
          category: 'Security',
          date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Mumbai, India',
          venue: 'Bandra Kurla Complex Arena',
          ticket_price: 0.00,
          total_capacity: 100,
          registered_count: 88,
          status: 'UPCOMING',
        },
      ];

      for (const evt of sampleEvents) {
        await pool.query(
          `INSERT INTO events (organizer_id, title, description, category, date, location, venue, ticket_price, total_capacity, registered_count, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            organizerId,
            evt.title,
            evt.description,
            evt.category,
            evt.date,
            evt.location,
            evt.venue,
            evt.ticket_price,
            evt.total_capacity,
            evt.registered_count,
            evt.status,
          ]
        );
      }

      console.log('[Database]: Demo users and events auto-seeded successfully!');
    }
  } catch (seedErr) {
    console.warn(`[Database Notice]: Auto-seed notice: ${seedErr.message}`);
  }
};

// Initialize tables on application startup
const initDb = async () => {
  try {
    // 1. Ensure local database exists (local dev only - cloud databases on Render are already provisioned)
    if (!process.env.DATABASE_URL && env.NODE_ENV !== 'production') {
      try {
        const adminPool = new Pool({
          user: env.DB_USER,
          password: env.DB_PASSWORD,
          host: env.DB_HOST,
          port: env.DB_PORT,
          database: 'postgres',
        });

        const checkRes = await adminPool.query(
          "SELECT 1 FROM pg_database WHERE datname = $1",
          [env.DB_NAME]
        );

        if (checkRes.rows.length === 0) {
          await adminPool.query(`CREATE DATABASE ${env.DB_NAME}`);
          console.log(`[Database]: Created PostgreSQL database "${env.DB_NAME}"`);
        }
        await adminPool.end();
      } catch (checkErr) {
        console.warn(`[Database Notice]: Local database check skipped: ${checkErr.message}`);
      }
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
        checked_in_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      );
    `;
    await pool.query(createPassesTableQuery);

    // 5. Ensure 'checked_in_at' column exists
    await pool.query('ALTER TABLE passes ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE;');

    // 6. Auto-seed initial demo accounts and events if fresh/empty
    await autoSeedIfEmpty();

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
