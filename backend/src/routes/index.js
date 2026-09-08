const express = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const organizerRoutes = require('./organizer.routes');
const eventRoutes = require('./event.routes');
const passRoutes = require('./pass.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Auth module routes
router.use('/auth', authRoutes);

// Public events catalog
router.use('/events', eventRoutes);

// Attendee passes routes (Guarded by JWT)
router.use('/passes', passRoutes);

// Admin console routes (Guarded by JWT + Admin check)
router.use('/admin', adminRoutes);

// Organizer portal routes (Guarded by JWT + Organizer check)
router.use('/organizer', organizerRoutes);

module.exports = router;
