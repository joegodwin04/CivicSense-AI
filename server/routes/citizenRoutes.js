const express = require('express');
const { submitRequest } = require('../controllers/citizenController');

const router = express.Router();

// @desc    Submit a new citizen request
// @route   POST /api/citizen/requests
// @access  Public (or protected if auth is enforced)
router.post('/requests', submitRequest);

module.exports = router;
