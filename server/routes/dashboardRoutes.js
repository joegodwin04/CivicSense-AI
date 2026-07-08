const express = require('express');
const {
  getStats,
  getRequests,
  getAIPriority,
  updateStatus,
  getConstituencyAIInsights
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection and authorization to all dashboard routes
router.use(protect);
router.use(authorize('mp', 'admin'));

router.get('/stats', getStats);
router.get('/requests', getRequests);
router.get('/ai-priority', getAIPriority);
router.get('/ai-insights', getConstituencyAIInsights);
router.patch('/requests/:id/status', updateStatus);

module.exports = router;
