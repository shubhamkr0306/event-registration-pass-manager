const { query } = require('../config/db');
const { ROLES } = require('../config/constants');

// @desc    Get system overview metrics & counts
// @route   GET /api/v1/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsersRes = await query('SELECT count(*)::int AS count FROM users');
    const attendeesRes = await query("SELECT count(*)::int AS count FROM users WHERE role = 'ATTENDEE'");
    const organizersRes = await query("SELECT count(*)::int AS count FROM users WHERE role = 'ORGANIZER'");
    const adminsRes = await query("SELECT count(*)::int AS count FROM users WHERE role = 'ADMIN'");

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: totalUsersRes.rows[0].count,
        attendees: attendeesRes.rows[0].count,
        organizers: organizersRes.rows[0].count,
        admins: adminsRes.rows[0].count,
        dbStatus: 'CONNECTED',
        serverUptime: `${Math.floor(process.uptime())}s`,
      },
    });
  } catch (error) {
    console.error('[Admin Stats Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve system statistics.',
    });
  }
};

// @desc    Get all users list with optional role filter
// @route   GET /api/v1/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT id, name, email, role, created_at, updated_at FROM users';
    const params = [];

    if (role && ['ATTENDEE', 'ORGANIZER', 'ADMIN'].includes(role.toUpperCase())) {
      sql += ' WHERE role = $1';
      params.push(role.toUpperCase());
    }

    sql += ' ORDER BY id ASC';

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      users: result.rows,
    });
  } catch (error) {
    console.error('[Admin GetUsers Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
    });
  }
};

// @desc    Update a user's role (Promote / Demote)
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!role || !['ATTENDEE', 'ORGANIZER', 'ADMIN'].includes(role.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be ATTENDEE, ORGANIZER, or ADMIN.',
      });
    }

    const targetRole = role.toUpperCase();

    // Update user in PostgreSQL
    const result = await query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role, updated_at',
      [targetRole, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `User role updated to ${targetRole} successfully.`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('[Admin UpdateRole Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
    });
  }
};

// @desc    Delete a user account
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Prevent active admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `User "${result.rows[0].name}" has been removed.`,
    });
  } catch (error) {
    console.error('[Admin DeleteUser Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
    });
  }
};

// @desc    Get all event attendees and passes across the platform
// @route   GET /api/v1/admin/attendees
// @access  Private (Admin only)
const getAdminAttendees = async (req, res) => {
  try {
    const { eventId, status, search } = req.query;

    let sql = `
      SELECT p.id AS pass_id, p.pass_code, p.status, p.created_at AS registered_at, p.updated_at AS check_in_time,
             u.id AS user_id, u.name AS attendee_name, u.email AS attendee_email,
             e.id AS event_id, e.title AS event_title, e.category, e.date AS event_date, e.venue, e.location, e.ticket_price,
             org.name AS organizer_name
      FROM passes p
      JOIN users u ON p.user_id = u.id
      JOIN events e ON p.event_id = e.id
      JOIN users org ON e.organizer_id = org.id
      WHERE 1=1
    `;
    const params = [];

    if (eventId) {
      params.push(parseInt(eventId, 10));
      sql += ` AND p.event_id = $${params.length}`;
    }

    if (status) {
      params.push(status.toUpperCase());
      sql += ` AND p.status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length} OR LOWER(p.pass_code) LIKE $${params.length} OR LOWER(e.title) LIKE $${params.length})`;
    }

    sql += ` ORDER BY p.created_at DESC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      attendees: result.rows,
    });
  } catch (error) {
    console.error('[Admin GetAttendees Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendees.',
    });
  }
};

// @desc    Get system-wide event analytics and attendance metrics
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin only)
const getAdminAnalytics = async (req, res) => {
  try {
    // High-level system overview
    const totalEventsRes = await query('SELECT count(*)::int AS count FROM events');
    const totalPassesRes = await query('SELECT count(*)::int AS count FROM passes');
    const checkedInRes = await query("SELECT count(*)::int AS count FROM passes WHERE status = 'USED'");
    const totalCapacityRes = await query('SELECT COALESCE(sum(total_capacity), 0)::int AS count FROM events');
    const totalRevenueRes = await query(`
      SELECT COALESCE(sum(e.ticket_price), 0)::numeric AS revenue
      FROM passes p
      JOIN events e ON p.event_id = e.id
    `);

    // Performance by event
    const eventsAnalyticsRes = await query(`
      SELECT e.id, e.title, e.category, e.date, e.ticket_price, e.total_capacity, e.status,
             u.name AS organizer_name,
             count(p.id)::int AS total_registered,
             count(CASE WHEN p.status = 'USED' THEN 1 END)::int AS checked_in_count,
             count(CASE WHEN p.status = 'ACTIVE' THEN 1 END)::int AS pending_count,
             COALESCE(count(p.id) * e.ticket_price, 0)::numeric AS revenue
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN passes p ON e.id = p.event_id
      GROUP BY e.id, u.name
      ORDER BY e.date ASC
    `);

    // Category breakdown
    const categoryBreakdownRes = await query(`
      SELECT e.category,
             count(DISTINCT e.id)::int AS event_count,
             count(p.id)::int AS total_registrations,
             count(CASE WHEN p.status = 'USED' THEN 1 END)::int AS checked_in_count,
             COALESCE(sum(CASE WHEN p.id IS NOT NULL THEN e.ticket_price ELSE 0 END), 0)::numeric AS revenue
      FROM events e
      LEFT JOIN passes p ON e.id = p.event_id
      GROUP BY e.category
      ORDER BY total_registrations DESC
    `);

    const totalEvents = totalEventsRes.rows[0].count;
    const totalRegistrations = totalPassesRes.rows[0].count;
    const totalCheckedIn = checkedInRes.rows[0].count;
    const totalCapacity = totalCapacityRes.rows[0].count;
    const totalRevenue = parseFloat(totalRevenueRes.rows[0].revenue) || 0;
    const checkInRate = totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;
    const fillRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        totalEvents,
        totalRegistrations,
        totalCheckedIn,
        checkInRate,
        totalCapacity,
        fillRate,
        totalRevenue,
        events: eventsAnalyticsRes.rows,
        categories: categoryBreakdownRes.rows,
      },
    });
  } catch (error) {
    console.error('[Admin GetAnalytics Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event analytics.',
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAdminAttendees,
  getAdminAnalytics,
};
