const asyncHandler = require('express-async-handler');
const { AppError } = require('../middleware/errorMiddleware');
const Request = require('../models/Request');

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
        avgPriority
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
  const { status } = req.body;
  
  if (!['pending', 'processing', 'under-review', 'resolved'].includes(status)) {
    throw new AppError('Invalid status value', 400);
  }

  const request = await Request.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  res.status(200).json({
    success: true,
    data: request
  });
});

module.exports = {
  getStats,
  getRequests,
  getAIPriority,
  updateStatus
};
