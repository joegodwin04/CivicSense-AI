const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { AppError } = require('./errorMiddleware');
const User = require('../models/User');

// Protect routes - verifies JWT and attaches req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized, no token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new AppError('Not authorized, user no longer exists', 401);
    }

    next();
  } catch (error) {
    throw new AppError('Not authorized, token failed', 401);
  }
});

// Restrict route to specific roles, e.g. authorize('mp', 'admin')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new AppError(`Role '${req.user?.role}' is not authorized to access this resource`, 403);
  }
  next();
};

module.exports = { protect, authorize };
