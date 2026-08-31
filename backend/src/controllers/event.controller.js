const { query } = require('../config/db');

// @desc    Get all public upcoming and active events
// @route   GET /api/v1/events
// @access  Public
const getPublicEvents = async (req, res) => {
  try {
    const { search, category } = req.query;
    let sql = `
      SELECT e.id, e.title, e.description, e.category, e.date, e.location, e.venue,
             e.ticket_price, e.total_capacity, e.registered_count, e.status, e.created_at,
             u.name AS organizer_name
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE e.status IN ('UPCOMING', 'ACTIVE')
    `;
    const params = [];

    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      params.push(category.trim());
      sql += ` AND LOWER(e.category) = LOWER($${params.length})`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(e.title) LIKE $${params.length} OR LOWER(e.location) LIKE $${params.length} OR LOWER(e.venue) LIKE $${params.length})`;
    }

    sql += ' ORDER BY e.date ASC';

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      events: result.rows,
    });
  } catch (error) {
    console.error('[Public Events Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve public events.',
    });
  }
};

// @desc    Get single event public details by ID
// @route   GET /api/v1/events/:id
// @access  Public
const getEventDetails = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);

    const result = await query(
      `SELECT e.id, e.title, e.description, e.category, e.date, e.location, e.venue,
              e.ticket_price, e.total_capacity, e.registered_count, e.status, e.created_at,
              u.name AS organizer_name, u.email AS organizer_email
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       WHERE e.id = $1`,
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const event = result.rows[0];
    const availableSeats = Math.max(0, event.total_capacity - event.registered_count);
    const isSoldOut = availableSeats <= 0;

    return res.status(200).json({
      success: true,
      event: {
        ...event,
        available_seats: availableSeats,
        is_sold_out: isSoldOut,
      },
    });
  } catch (error) {
    console.error('[Public Event Details Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event details.',
    });
  }
};

module.exports = {
  getPublicEvents,
  getEventDetails,
};
