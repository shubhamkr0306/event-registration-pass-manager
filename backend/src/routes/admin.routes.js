const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAdminAttendees,
  getAdminAnalytics,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

// Guard all admin routes with JWT authentication & Admin role check
router.use(protect, adminOnly);

// Endpoints
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/attendees', getAdminAttendees);
router.get('/analytics', getAdminAnalytics);

module.exports = router;
