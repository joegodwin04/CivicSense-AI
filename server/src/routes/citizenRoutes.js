const express = require('express');
const asyncHandler = require('express-async-handler');
const { AppError } = require('../middlewares/errorMiddleware');
// const RequestModel = require('../models/Request'); // Assuming model exists

const router = express.Router();

// @desc    Submit a new citizen request
// @route   POST /api/citizen/requests
// @access  Public (or protected if auth is enforced)
router.post('/requests', asyncHandler(async (req, res, next) => {
  const { title, description, location } = req.body;

  if (!title || !description) {
    throw new AppError('Please provide a title and description', 400);
  }

  // Example of saving to DB
  // const newRequest = await RequestModel.create({ ...req.body });
  
  // IN A PRODUCTION APP (Stripe/Airbnb scale): 
  // We return a 202 Accepted and offload the heavy AI processing (Gemini) 
  // to a background queue (e.g., BullMQ) so the mobile client doesn't time out.
  
  res.status(202).json({
    success: true,
    message: 'Request received and queued for AI analysis',
    data: {
      id: 'mock_id_123',
      title,
      status: 'processing'
    }
  });
}));

module.exports = router;
