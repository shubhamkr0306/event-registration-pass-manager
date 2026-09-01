const express = require('express');
const { 
  bookPass, 
  getMyPasses, 
  cancelPass, 
  verifyPass, 
  checkInPass 
} = require('../controllers/pass.controller');
const { protect } = require('../middleware/auth.middleware');
const { organizerOrAdmin } = require('../middleware/organizer.middleware');

const router = express.Router();

// Protected route: Only authenticated Organizers & Admins can verify/scan passes
router.post('/verify', protect, organizerOrAdmin, verifyPass);

// Protected attendee routes (require valid JWT login token)
router.post('/book', protect, bookPass);
router.get('/my-passes', protect, getMyPasses);
router.delete('/:id', protect, cancelPass);

// Protected organizer/admin gate check-in route
router.patch('/:id/check-in', protect, organizerOrAdmin, checkInPass);

module.exports = router;

