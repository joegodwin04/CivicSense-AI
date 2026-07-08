const express = require('express');
const asyncHandler = require('express-async-handler');
const Request = require('../models/Request');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// NOTE: swap `protect, authorize('mp', 'admin')` back in once you have
// real MP accounts to test with. Left open (no auth) for now so the
// dashboard is easy to demo/test end-to-end.
// router.use(protect, authorize('mp', 'admin'));

// @desc    Get aggregated stats for charts (requests grouped by category)
// @route   GET /api/dashboard/stats
// @access  Private (MP/Admin)
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const byCategory = await Request.aggregate([
      { $group: { _id: '$category', requests: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', requests: 1 } },
      { $sort: { requests: -1 } },
    ]);

    const totals = await Request.aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          avgPriority: { $avg: '$priorityScore' },
          unresolved: {
            $sum: { $cond: [{ $ne: ['$status', 'resolved'] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byCategory,
        totals: totals[0] || { totalRequests: 0, avgPriority: 0, unresolved: 0 },
      },
    });
  })
);

// @desc    List requests sorted by priority (highest first), for the map/table
// @route   GET /api/dashboard/requests
// @access  Private (MP/Admin)
router.get(
  '/requests',
  asyncHandler(async (req, res) => {
    const { status, category, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const requests = await Request.find(filter)
      .sort({ priorityScore: -1, createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({ success: true, count: requests.length, data: requests });
  })
);

// @desc    Update a request's status (e.g. mark in_progress / resolved)
// @route   PATCH /api/dashboard/requests/:id
// @access  Private (MP/Admin)
router.patch(
  '/requests/:id',
  asyncHandler(async (req, res) => {
    const { status } = req.body;

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    res.status(200).json({ success: true, data: request });
  })
);

module.exports = router;
