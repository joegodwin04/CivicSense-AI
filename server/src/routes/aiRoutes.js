const express = require('express');
const asyncHandler = require('express-async-handler');
const { AppError } = require('../middlewares/errorMiddleware');
const { analyzeCitizenRequest } = require('../services/aiService');

const router = express.Router();

// @desc    Run Gemini analysis on arbitrary text (useful for testing/demoing
//          the AI service directly, without creating a Request document)
// @route   POST /api/ai/analyze
// @access  Public (lock this down with `protect` before shipping to prod)
router.post(
  '/analyze',
  asyncHandler(async (req, res) => {
    const { text, nearbyInfrastructure } = req.body;

    if (!text) {
      throw new AppError('Please provide "text" to analyze', 400);
    }

    const result = await analyzeCitizenRequest(text, nearbyInfrastructure || []);
    res.status(200).json({ success: true, data: result });
  })
);

module.exports = router;
