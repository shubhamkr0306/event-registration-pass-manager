const { query } = require('../config/db');

// @desc    Get dashboard metrics for the logged-in organizer
// @route   GET /api/v1/organizer/stats
// @access  Private (Organizer only)
const getOrganizerStats = async (req, res) => {
  try {
    const organizerId = req.user.id;

    // Aggregate counts from PostgreSQL
    const totalEventsRes = await query(
      'SELECT count(*)::int AS count FROM events WHERE organizer_id = $1',
      [organizerId]
    );

    const registrationsRes = await query(
      'SELECT COALESCE(sum(registered_count), 0)::int AS count FROM events WHERE organizer_id = $1',
      [organizerId]
    );

    const capacityRes = await query(
      'SELECT COALESCE(sum(total_capacity), 0)::int AS count FROM events WHERE organizer_id = $1',
      [organizerId]
    );

    const activeEventsRes = await query(
      "SELECT count(*)::int AS count FROM events WHERE organizer_id = $1 AND status IN ('UPCOMING', 'ACTIVE')",
      [organizerId]
    );

    const revenueRes = await query(
      'SELECT COALESCE(sum(registered_count * ticket_price), 0)::numeric AS total FROM events WHERE organizer_id = $1',
      [organizerId]
    );

    const totalEvents = totalEventsRes.rows[0].count;
    const totalRegistrations = registrationsRes.rows[0].count;
    const totalCapacity = capacityRes.rows[0].count;
    const activeEvents = activeEventsRes.rows[0].count;
    const totalRevenue = parseFloat(revenueRes.rows[0].total) || 0;

    const fillRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        totalRegistrations,
        totalCapacity,
        activeEvents,
        fillRate,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('[Organizer Stats Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve organizer dashboard metrics.',
    });
  }
};

// @desc    Get all events created by the logged-in organizer
// @route   GET /api/v1/organizer/events
// @access  Private (Organizer only)
const getMyEvents = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const result = await query(
      'SELECT * FROM events WHERE organizer_id = $1 ORDER BY date ASC',
      [organizerId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      events: result.rows,
    });
  } catch (error) {
    console.error('[Organizer GetEvents Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hosted events.',
    });
  }
};

// @desc    Create a new event
// @route   POST /api/v1/organizer/events
// @access  Private (Organizer only)
const createEvent = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const {
      title,
      description,
      category = 'Technology',
      date,
      location,
      venue,
      ticket_price = 0,
      total_capacity,
    } = req.body;

    // Field validation
    if (!title || !description || !date || !location || !venue || !total_capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, date, location, venue, and total capacity.',
      });
    }

    if (parseInt(total_capacity, 10) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total capacity must be a positive number.',
      });
    }

    const result = await query(
      `INSERT INTO events (organizer_id, title, description, category, date, location, venue, ticket_price, total_capacity, registered_count, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 'UPCOMING')
       RETURNING *`,
      [
        organizerId,
        title.trim(),
        description.trim(),
        category.trim(),
        date,
        location.trim(),
        venue.trim(),
        parseFloat(ticket_price) || 0.00,
        parseInt(total_capacity, 10),
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Event published successfully.',
      event: result.rows[0],
    });
  } catch (error) {
    console.error('[Organizer CreateEvent Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event.',
    });
  }
};

// @desc    Get single event details by ID
// @route   GET /api/v1/organizer/events/:id
// @access  Private (Organizer only)
const getEventById = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const eventId = parseInt(req.params.id, 10);

    const result = await query(
      'SELECT * FROM events WHERE id = $1 AND organizer_id = $2',
      [eventId, organizerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized.',
      });
    }

    return res.status(200).json({
      success: true,
      event: result.rows[0],
    });
  } catch (error) {
    console.error('[Organizer GetEventById Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event details.',
    });
  }
};

// @desc    Update an existing event
// @route   PUT /api/v1/organizer/events/:id
// @access  Private (Organizer only)
const updateEvent = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const eventId = parseInt(req.params.id, 10);
    const {
      title,
      description,
      category,
      date,
      location,
      venue,
      ticket_price,
      total_capacity,
      status,
    } = req.body;

    const result = await query(
      `UPDATE events
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           date = COALESCE($4, date),
           location = COALESCE($5, location),
           venue = COALESCE($6, venue),
           ticket_price = COALESCE($7, ticket_price),
           total_capacity = COALESCE($8, total_capacity),
           status = COALESCE($9, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND organizer_id = $11
       RETURNING *`,
      [
        title,
        description,
        category,
        date,
        location,
        venue,
        ticket_price,
        total_capacity,
        status,
        eventId,
        organizerId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      event: result.rows[0],
    });
  } catch (error) {
    console.error('[Organizer UpdateEvent Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update event.',
    });
  }
};

// @desc    Delete an event
// @route   DELETE /api/v1/organizer/events/:id
// @access  Private (Organizer only)
const deleteEvent = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const eventId = parseInt(req.params.id, 10);

    const result = await query(
      'DELETE FROM events WHERE id = $1 AND organizer_id = $2 RETURNING id, title',
      [eventId, organizerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Event "${result.rows[0].title}" was deleted successfully.`,
    });
  } catch (error) {
    console.error('[Organizer DeleteEvent Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete event.',
    });
  }
};

// @desc    Get all attendees and passes for the logged-in organizer's events
// @route   GET /api/v1/organizer/attendees
// @access  Private (Organizer only)
const getOrganizerAttendees = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const { eventId, status, search } = req.query;

    let sql = `
      SELECT p.id AS pass_id, p.pass_code, p.status, p.created_at AS registered_at, p.updated_at AS check_in_time,
             u.id AS user_id, u.name AS attendee_name, u.email AS attendee_email,
             e.id AS event_id, e.title AS event_title, e.category, e.date AS event_date, e.venue, e.location, e.ticket_price
      FROM passes p
      JOIN users u ON p.user_id = u.id
      JOIN events e ON p.event_id = e.id
      WHERE e.organizer_id = $1
    `;
    const params = [organizerId];

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
    console.error('[Organizer GetAttendees Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendees.',
    });
  }
};

// @desc    Get detailed event analytics and attendance metrics for organizer's events
// @route   GET /api/v1/organizer/analytics
// @access  Private (Organizer only)
const getOrganizerAnalytics = async (req, res) => {
  try {
    const organizerId = req.user.id;

    // High-level overview
    const totalEventsRes = await query(
      'SELECT count(*)::int AS count FROM events WHERE organizer_id = $1',
      [organizerId]
    );

    const totalPassesRes = await query(`
      SELECT count(p.id)::int AS count
      FROM passes p
      JOIN events e ON p.event_id = e.id
      WHERE e.organizer_id = $1
    `, [organizerId]);

    const checkedInRes = await query(`
      SELECT count(p.id)::int AS count
      FROM passes p
      JOIN events e ON p.event_id = e.id
      WHERE e.organizer_id = $1 AND p.status = 'USED'
    `, [organizerId]);

    const totalCapacityRes = await query(
      'SELECT COALESCE(sum(total_capacity), 0)::int AS count FROM events WHERE organizer_id = $1',
      [organizerId]
    );

    const totalRevenueRes = await query(`
      SELECT COALESCE(sum(e.ticket_price), 0)::numeric AS revenue
      FROM passes p
      JOIN events e ON p.event_id = e.id
      WHERE e.organizer_id = $1
    `, [organizerId]);

    // Performance by individual event
    const eventsAnalyticsRes = await query(`
      SELECT e.id, e.title, e.category, e.date, e.ticket_price, e.total_capacity, e.status,
             count(p.id)::int AS total_registered,
             count(CASE WHEN p.status = 'USED' THEN 1 END)::int AS checked_in_count,
             count(CASE WHEN p.status = 'ACTIVE' THEN 1 END)::int AS pending_count,
             COALESCE(count(p.id) * e.ticket_price, 0)::numeric AS revenue
      FROM events e
      LEFT JOIN passes p ON e.id = p.event_id
      WHERE e.organizer_id = $1
      GROUP BY e.id
      ORDER BY e.date ASC
    `, [organizerId]);

    // Category breakdown
    const categoryBreakdownRes = await query(`
      SELECT e.category,
             count(DISTINCT e.id)::int AS event_count,
             count(p.id)::int AS total_registrations,
             count(CASE WHEN p.status = 'USED' THEN 1 END)::int AS checked_in_count,
             COALESCE(sum(CASE WHEN p.id IS NOT NULL THEN e.ticket_price ELSE 0 END), 0)::numeric AS revenue
      FROM events e
      LEFT JOIN passes p ON e.id = p.event_id
      WHERE e.organizer_id = $1
      GROUP BY e.category
      ORDER BY total_registrations DESC
    `, [organizerId]);

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
    console.error('[Organizer GetAnalytics Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event analytics.',
    });
  }
};

module.exports = {
  getOrganizerStats,
  getMyEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getOrganizerAttendees,
  getOrganizerAnalytics,
};
