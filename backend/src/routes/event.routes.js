const express = require('express');
const { getPublicEvents, getEventDetails } = require('../controllers/event.controller');

const router = express.Router();

// Public routes (anyone can browse and view events)
router.get('/', getPublicEvents);
router.get('/:id', getEventDetails);

module.exports = router;
