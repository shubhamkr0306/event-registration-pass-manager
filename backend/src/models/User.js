const { query } = require('../config/db');

const User = {
  // Find a user by their email address
  async findByEmail(email) {
    const result = await query(
      'SELECT id, name, email, password, role, created_at FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    return result.rows[0] || null;
  },

  // Find a user by their primary key id
  async findById(id) {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Create a new user record in PostgreSQL
  async create({ name, email, password, role = 'ATTENDEE' }) {
    const result = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, LOWER($2), $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.trim(), password, role.toUpperCase()]
    );
    return result.rows[0];
  },
};

module.exports = User;
