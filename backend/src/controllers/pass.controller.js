const { query } = require('../config/db');
const { encryptPassToken, decryptPassToken } = require('../utils/qrSecurity');

// Helper to generate unique human-readable pass codes
const generatePassCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PASS-${timestamp}-${randomPart}`;
};

// @desc    Register attendee for an event & issue digital pass
// @route   POST /api/v1/passes/book
// @access  Private (Authenticated users / Attendees)
const bookPass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid event ID.',
      });
    }

    // 1. Fetch event and verify availability
    const eventRes = await query(
      'SELECT id, title, total_capacity, registered_count, status FROM events WHERE id = $1',
      [parseInt(eventId, 10)]
    );

    if (eventRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const event = eventRes.rows[0];

    if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: `Cannot register. This event is currently ${event.status.toLowerCase()}.`,
      });
    }

    if (event.registered_count >= event.total_capacity) {
      return res.status(400).json({
        success: false,
        message: 'This event has reached full capacity (Sold Out).',
      });
    }

    // 2. Check for duplicate registration
    const existingPassRes = await query(
      'SELECT id, pass_code FROM passes WHERE user_id = $1 AND event_id = $2',
      [userId, event.id]
    );

    if (existingPassRes.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `You have already registered for this event (Pass Code: ${existingPassRes.rows[0].pass_code}).`,
      });
    }

    // 3. Generate unique pass code & tamper-proof AES-256-GCM encrypted QR token
    const passCode = generatePassCode();
    const qrCodeData = encryptPassToken({
      code: passCode,
      eventId: event.id,
      userId,
      issuedAt: new Date().toISOString(),
    });

    // 4. Insert pass record in PostgreSQL
    const passInsertRes = await query(
      `INSERT INTO passes (pass_code, user_id, event_id, status, qr_code_data)
       VALUES ($1, $2, $3, 'ACTIVE', $4)
       RETURNING id, pass_code, status, created_at`,
      [passCode, userId, event.id, qrCodeData]
    );

    // 5. Safely increment registered count on event
    await query(
      'UPDATE events SET registered_count = registered_count + 1 WHERE id = $1',
      [event.id]
    );

    return res.status(201).json({
      success: true,
      message: `Pass booked successfully for "${event.title}"!`,
      pass: passInsertRes.rows[0],
    });
  } catch (error) {
    console.error('[Book Pass Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to book event pass. Please try again.',
    });
  }
};

// @desc    Get all digital passes issued to the logged-in user
// @route   GET /api/v1/passes/my-passes
// @access  Private
const getMyPasses = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT p.id, p.pass_code, p.status, p.created_at, p.qr_code_data,
              e.id AS event_id, e.title AS event_title, e.description AS event_description,
              e.category, e.date AS event_date, e.location, e.venue, e.ticket_price,
              u.name AS organizer_name
       FROM passes p
       JOIN events e ON p.event_id = e.id
       JOIN users u ON e.organizer_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    const passes = await Promise.all(
      result.rows.map(async (p) => {
        // Guarantee tamper-proof encryption on legacy passes
        if (!p.qr_code_data || !p.qr_code_data.startsWith('EPASS_')) {
          let payload = {
            code: p.pass_code,
            eventId: p.event_id,
            userId,
            issuedAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
          };
          try {
            const parsed = JSON.parse(p.qr_code_data);
            if (parsed.issuedAt) payload.issuedAt = parsed.issuedAt;
          } catch (e) {}

          const encrypted = encryptPassToken(payload);
          p.qr_code_data = encrypted;
          // Asynchronously update in PostgreSQL
          query('UPDATE passes SET qr_code_data = $1 WHERE id = $2', [encrypted, p.id]).catch(() => {});
        }
        return p;
      })
    );

    return res.status(200).json({
      success: true,
      count: passes.length,
      passes,
    });
  } catch (error) {
    console.error('[Get My Passes Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your passes.',
    });
  }
};

// @desc    Cancel a pass and free up seat capacity
// @route   DELETE /api/v1/passes/:id
// @access  Private
const cancelPass = async (req, res) => {
  try {
    const userId = req.user.id;
    const passId = parseInt(req.params.id, 10);

    // Verify pass belongs to the user
    const passRes = await query(
      'SELECT id, event_id, pass_code FROM passes WHERE id = $1 AND user_id = $2',
      [passId, userId]
    );

    if (passRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found or unauthorized.',
      });
    }

    const { event_id, pass_code } = passRes.rows[0];

    // Delete pass
    await query('DELETE FROM passes WHERE id = $1', [passId]);

    // Decrement event registered_count safely
    await query(
      'UPDATE events SET registered_count = GREATEST(registered_count - 1, 0) WHERE id = $1',
      [event_id]
    );

    return res.status(200).json({
      success: true,
      message: `Pass ${pass_code} has been cancelled and your seat released.`,
    });
  } catch (error) {
    console.error('[Cancel Pass Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel pass.',
    });
  }
};

// @desc    Verify authenticity of a digital pass via pass code or QR payload
// @route   POST /api/v1/passes/verify
// @access  Public (Gate check-in / Attendee verification)
const verifyPass = async (req, res) => {
  try {
    const { passCode } = req.body;

    if (!passCode || typeof passCode !== 'string') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Please provide a valid pass code to verify.',
      });
    }

    // Clean input (trim whitespace)
    let cleanCode = passCode.trim();

    // Check if input is a tamper-proof AES-256-GCM encrypted QR token
    if (cleanCode.startsWith('EPASS_')) {
      const decrypted = decryptPassToken(cleanCode);
      if (!decrypted || (!decrypted.code && !decrypted.passCode)) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: 'Invalid or forged QR token. Cryptographic authenticity verification failed.',
        });
      }
      cleanCode = decrypted.code || decrypted.passCode;
    } else if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
      // Support legacy JSON payloads
      try {
        const parsed = JSON.parse(cleanCode);
        if (parsed.code) cleanCode = parsed.code;
        if (parsed.passCode) cleanCode = parsed.passCode;
      } catch (e) {
        // Fall back to original string
      }
    }

    // Query database for matching pass with user and event details
    const result = await query(
      `SELECT p.id, p.pass_code, p.status, p.created_at, p.qr_code_data,
              u.id AS user_id, u.name AS attendee_name, u.email AS attendee_email,
              e.id AS event_id, e.title AS event_title, e.category, e.date AS event_date,
              e.venue, e.location, e.status AS event_status,
              org.name AS organizer_name
       FROM passes p
       JOIN users u ON p.user_id = u.id
       JOIN events e ON p.event_id = e.id
       JOIN users org ON e.organizer_id = org.id
       WHERE UPPER(p.pass_code) = UPPER($1) OR p.qr_code_data = $1`,
      [cleanCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid Pass Code. No matching registration found.',
      });
    }

    const pass = result.rows[0];

    // Check pass status conditions
    if (pass.status === 'CANCELLED') {
      return res.status(200).json({
        success: true,
        valid: false,
        status: 'CANCELLED',
        message: 'Warning: This pass has been cancelled and is no longer valid.',
        pass,
      });
    }

    if (pass.status === 'USED') {
      return res.status(200).json({
        success: true,
        valid: false,
        status: 'USED',
        message: 'Notice: This pass has already been used / checked in at the venue.',
        pass,
      });
    }

    // If ACTIVE, pass is completely valid and attendee is verified
    return res.status(200).json({
      success: true,
      valid: true,
      status: 'ACTIVE',
      message: 'Pass Verified! Attendee is officially registered for this event.',
      pass,
    });
  } catch (error) {
    console.error('[Verify Pass Error]:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Server error while verifying pass.',
    });
  }
};

// @desc    Check-in attendee at venue gate & mark pass as USED
// @route   PATCH /api/v1/passes/:id/check-in
// @access  Private (Organizer / Admin)
const checkInPass = async (req, res) => {
  try {
    const passId = parseInt(req.params.id, 10);

    const passRes = await query(
      'SELECT id, pass_code, status FROM passes WHERE id = $1',
      [passId]
    );

    if (passRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found.',
      });
    }

    const pass = passRes.rows[0];
    const { action } = req.body || {};

    // Support check-in reversal for accidental check-ins
    if (action === 'REVERT') {
      if (pass.status !== 'USED') {
        return res.status(400).json({
          success: false,
          message: 'Can only revert a pass that is currently checked in (USED).',
        });
      }

      await query(
        "UPDATE passes SET status = 'ACTIVE', updated_at = NOW() WHERE id = $1",
        [passId]
      );

      return res.status(200).json({
        success: true,
        message: `Check-in reverted. Pass ${pass.pass_code} is now reset to ACTIVE.`,
      });
    }

    if (pass.status === 'USED') {
      return res.status(400).json({
        success: false,
        message: 'Attendee has already been checked in with this pass.',
      });
    }

    if (pass.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot check in a cancelled pass.',
      });
    }

    // Update status to 'USED' in PostgreSQL
    await query(
      "UPDATE passes SET status = 'USED', updated_at = NOW() WHERE id = $1",
      [passId]
    );

    return res.status(200).json({
      success: true,
      message: `Check-in successful! Attendee with pass ${pass.pass_code} has been admitted.`,
    });
  } catch (error) {
    console.error('[Check In Pass Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process pass check-in.',
    });
  }
};

module.exports = {
  bookPass,
  getMyPasses,
  cancelPass,
  verifyPass,
  checkInPass,
};
