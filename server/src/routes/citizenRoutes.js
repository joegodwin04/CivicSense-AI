const express = require('express');
const asyncHandler = require('express-async-handler');
const { AppError } = require('../middlewares/errorMiddleware');
const RequestModel = require('../models/Request');
const { analyzeCitizenRequest } = require('../services/aiService');
const logger = require('../utils/logger');

const router = express.Router();

// Runs Gemini analysis in the background and updates the document once done.
// Kept in this file (rather than a real queue) to stay dependency-free;
// swap this out for BullMQ/SQS once you have real production traffic.
const runAiAnalysis = async (requestId, rawText, location) => {
  try {
    const aiResult = await analyzeCitizenRequest(rawText, location ? [location] : []);
    await RequestModel.findByIdAndUpdate(requestId, {
      ...aiResult,
      status: 'analyzed',
    });
    logger.info(`AI analysis stored for request ${requestId}`);
  } catch (error) {
    logger.error(`Background AI analysis failed for request ${requestId}: ${error.message}`);
    // Leave status as 'processing' so it can be retried/reviewed manually.
  }
};

// @desc    Submit a new citizen request
// @route   POST /api/citizen/requests
// @access  Public (or protected if auth is enforced)
router.post('/requests', asyncHandler(async (req, res, next) => {
  const { title, description, location } = req.body;

  if (!title || !description) {
    throw new AppError('Please provide a title and description', 400);
  }

  const newRequest = await RequestModel.create({
    title,
    description,
    location,
    status: 'processing',
  });

  // Respond immediately (202 Accepted) so the client doesn't wait on Gemini,
  // then run the AI analysis in the background and update the record after.
  res.status(202).json({
    success: true,
    message: 'Request received and queued for AI analysis',
    data: {
      id: newRequest._id,
      title: newRequest.title,
      status: newRequest.status,
    },
  });

  runAiAnalysis(newRequest._id, description, location);
}));

// @desc    Get a single request's status/result (poll this after submitting)
// @route   GET /api/citizen/requests/:id
// @access  Public
router.get('/requests/:id', asyncHandler(async (req, res) => {
  const request = await RequestModel.findById(req.params.id);

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  res.status(200).json({ success: true, data: request });
}));

module.exports = router;
