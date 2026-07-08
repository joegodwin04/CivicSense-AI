const asyncHandler = require('express-async-handler');
const { AppError } = require('../middleware/errorMiddleware');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const { generateConstituencyInsights } = require('../services/aiService');

const categoryMap = {
  roads: 'Roads & Infrastructure',
  water: 'Water Supply',
  health: 'Healthcare',
  education: 'Education',
  electricity: 'Electricity',
  sanitation: 'Sanitation',
  other: 'Other'
};

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/stats
// @access  Private (MP/Admin)
const getStats = asyncHandler(async (req, res) => {
  const totalRequests = await Request.countDocuments({ isDuplicate: { $ne: true } });
  const unresolved = await Request.countDocuments({ status: { $ne: 'resolved' }, isDuplicate: { $ne: true } });

  const pending = await Request.countDocuments({ status: 'pending', isDuplicate: { $ne: true } });
  const processing = await Request.countDocuments({ status: 'processing', isDuplicate: { $ne: true } });
  const underReview = await Request.countDocuments({ status: 'under-review', isDuplicate: { $ne: true } });
  const resolved = await Request.countDocuments({ status: 'resolved', isDuplicate: { $ne: true } });
  const rejected = await Request.countDocuments({ status: 'rejected', isDuplicate: { $ne: true } });

  const avgResult = await Request.aggregate([
    { $match: { isDuplicate: { $ne: true } } },
    {
      $group: {
        _id: null,
        avg: { $avg: '$priorityScore' }
      }
    }
  ]);
  const avgPriority = avgResult[0]?.avg || 0;

  // Aggregate request counts by category
  const categoryCounts = await Request.aggregate([
    { $match: { isDuplicate: { $ne: true } } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  // Construct chart dataset with proper labels
  const byCategory = Object.keys(categoryMap).map((catId) => ({
    name: categoryMap[catId],
    requests: 0
  }));

  categoryCounts.forEach((group) => {
    const catId = (group._id || 'other').toLowerCase();
    const name = categoryMap[catId] || categoryMap.other;
    const index = byCategory.findIndex((c) => c.name === name);
    if (index > -1) {
      byCategory[index].requests = group.count;
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totals: {
        totalRequests,
        unresolved,
        avgPriority,
        pending,
        processing,
        'under-review': underReview,
        resolved,
        rejected,
        total: totalRequests
      },
      byCategory
    }
  });
});

// @desc    Get recent requests sorted by priorityScore
// @route   GET /api/dashboard/requests
// @access  Private (MP/Admin)
const getRequests = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  
  // Fetch requests, sorting by priorityScore descending
  const requests = await Request.find({ isDuplicate: { $ne: true } })
    .sort({ priorityScore: -1, createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

// @desc    Get top-priority AI analyzed request
// @route   GET /api/dashboard/ai-priority
// @access  Private (MP/Admin)
const getAIPriority = asyncHandler(async (req, res) => {
  const request = await Request.findOne({ isDuplicate: { $ne: true } })
    .sort({ priorityScore: -1 })
    .limit(1);

  if (!request) {
    throw new AppError('No requests found', 404);
  }

  res.status(200).json({
    success: true,
    data: request
  });
});

// @desc    Update request status
// @route   PATCH /api/dashboard/requests/:id/status
// @access  Private (MP/Admin)
const updateStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  
  if (!['pending', 'processing', 'under-review', 'resolved', 'rejected'].includes(status)) {
    throw new AppError('Invalid status value', 400);
  }

  const request = await Request.findById(req.params.id);

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  request.status = status;
  request.statusHistory.push({
    status,
    notes: notes || `Representative updated status to ${status}.`
  });

  await request.save();

  // Create status change notification for the reporting citizen
  if (request.user) {
    try {
      await Notification.create({
        user: request.user,
        request: request._id,
        type: 'status_change',
        message: `Your civic report titled "${request.title}" has been updated to: ${status.toUpperCase()}.`
      });
    } catch (err) {
      console.error('Failed to create status change notification:', err.message);
    }
  }

  res.status(200).json({
    success: true,
    data: request
  });
});

// @desc    Get constituency AI summary, recommendations, and schemes
// @route   GET /api/dashboard/ai-insights
// @access  Private (MP/Admin)
const getConstituencyAIInsights = asyncHandler(async (req, res) => {
  const constituency = req.user.constituency || 'Bengaluru Central';
  
  // Aggregate request counts by status
  const total = await Request.countDocuments({ isDuplicate: { $ne: true } });
  const pending = await Request.countDocuments({ status: 'pending', isDuplicate: { $ne: true } });
  const processing = await Request.countDocuments({ status: 'processing', isDuplicate: { $ne: true } });
  const underReview = await Request.countDocuments({ status: 'under-review', isDuplicate: { $ne: true } });
  const resolved = await Request.countDocuments({ status: 'resolved', isDuplicate: { $ne: true } });
  const rejected = await Request.countDocuments({ status: 'rejected', isDuplicate: { $ne: true } });

  // Average priority score
  const avgResult = await Request.aggregate([
    { $match: { isDuplicate: { $ne: true } } },
    { $group: { _id: null, avg: { $avg: '$priorityScore' } } }
  ]);
  const avgPriority = avgResult[0]?.avg || 0;

  // Retrieve top 5 critical requests
  const topRequests = await Request.find({ isDuplicate: { $ne: true } })
    .sort({ priorityScore: -1 })
    .limit(5);

  const metrics = {
    totalReports: total,
    pending,
    processing,
    underReview,
    resolved,
    rejected,
    averagePriorityScore: Math.round(avgPriority)
  };

  const insights = await generateConstituencyInsights(
    constituency,
    metrics,
    topRequests
  );

  res.status(200).json({
    success: true,
    data: insights
  });
});

module.exports = {
  getStats,
  getRequests,
  getAIPriority,
  updateStatus,
  getConstituencyAIInsights
};
