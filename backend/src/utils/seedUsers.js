const bcrypt = require('bcryptjs');
const { query, initDb } = require('../config/db');

const seedDemoAccounts = async () => {
  try {
    await initDb();

    const demoUsers = [
      {
        name: 'Aarav Patel (Attendee)',
        email: 'attendee@shnoor.com',
        password: 'password123',
        role: 'ATTENDEE',
      },
      {
        name: 'Shubham Kumar',
        email: 'organizer@shnoor.com',
        password: 'password123',
        role: 'ORGANIZER',
      },
      {
        name: 'System Admin',
        email: 'admin@shnoor.com',
        password: 'password123',
        role: 'ADMIN',
      },
    ];

    const salt = await bcrypt.genSalt(10);

    for (const u of demoUsers) {
      const existing = await query('SELECT id, email, role FROM users WHERE LOWER(email) = LOWER($1)', [u.email]);
      if (existing.rows.length === 0) {
        const hashedPassword = await bcrypt.hash(u.password, salt);
        await query(
          'INSERT INTO users (name, email, password, role) VALUES ($1, LOWER($2), $3, $4)',
          [u.name, u.email, hashedPassword, u.role]
        );
        console.log(`[Seed]: Created demo user -> ${u.email} (${u.role})`);
      } else {
        console.log(`[Seed]: Demo user already exists -> ${u.email} (${existing.rows[0].role})`);
      }
    }

    console.log('[Seed]: All demo accounts are ready in PostgreSQL!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDemoAccounts();
