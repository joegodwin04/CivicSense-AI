const asyncHandler = require('express-async-handler');
const { AppError } = require('../middleware/errorMiddleware');
const User = require('../models/User');
const Request = require('../models/Request');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = asyncHandler(async (req, res) => {
  const citizensCount = await User.countDocuments({ role: 'citizen' });
  const activeMpsCount = await User.countDocuments({ role: 'mp', verified: true });
  const pendingMpsCount = await User.countDocuments({ role: 'mp', verified: false });
  const reportsCount = await Request.countDocuments({});

  const pendingMps = await User.find({ role: 'mp', verified: false })
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      stats: {
        citizensCount,
        activeMpsCount,
        pendingMpsCount,
        reportsCount
      },
      pendingMps
    }
  });
});

// @desc    Get all users (citizens, mps, admins)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('-password')
    .sort({ role: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Verify MP account
// @route   PATCH /api/admin/verify-mp/:id
// @access  Private (Admin only)
const verifyMP = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role !== 'mp') {
    throw new AppError('User is not an MP account', 400);
  }

  user.verified = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: `MP account for ${user.name} verified successfully`,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      constituency: user.constituency,
      verified: user.verified
    }
  });
});

// @desc    Reject MP verification request (Deletes the unverified user)
// @route   DELETE /api/admin/reject-mp/:id
// @access  Private (Admin only)
const rejectMP = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role !== 'mp') {
    throw new AppError('User is not an MP account', 400);
  }

  if (user.verified) {
    throw new AppError('Cannot reject an already verified MP account', 400);
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: `MP account verification request for ${user.name} was rejected and deleted`
  });
});

// @desc    Delete user account (Citizen or MP)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent deleting admin accounts for security
  if (user.role === 'admin') {
    throw new AppError('Cannot delete administrator accounts', 400);
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: `User account for ${user.name} has been deleted successfully`
  });
});

module.exports = {
  getAdminStats,
  getAllUsers,
  verifyMP,
  rejectMP,
  deleteUser
};
