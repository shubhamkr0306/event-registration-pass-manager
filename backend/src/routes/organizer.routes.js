const express = require('express');
const {
  getOrganizerStats,
  getMyEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getOrganizerAttendees,
  getOrganizerAnalytics,
} = require('../controllers/organizer.controller');
const { protect } = require('../middleware/auth.middleware');
const { organizerOnly } = require('../middleware/organizer.middleware');

const router = express.Router();

// Guard all organizer routes with JWT token + Organizer role check
router.use(protect, organizerOnly);

// Stats & Events endpoints
router.get('/stats', getOrganizerStats);
router.get('/events', getMyEvents);
router.post('/events', createEvent);
router.get('/events/:id', getEventById);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.get('/attendees', getOrganizerAttendees);
router.get('/analytics', getOrganizerAnalytics);

module.exports = router;
