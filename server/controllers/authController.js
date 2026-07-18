const User = require('../models/User');
const jwt = require("jsonwebtoken");
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('express-async-handler');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
// @desc    Register a new user (MP or Citizen)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, constituency } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  if (role === 'mp') {
    const isGovEmail = email.endsWith('@gov.in') || email.endsWith('@nic.in');
    if (!isGovEmail) {
      throw new AppError('MP registration is restricted to government emails ending with @gov.in or @nic.in', 400);
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    constituency,
    verified: role === 'mp' ? false : true
  });

  if (user) {
    const isMpPending = user.role === 'mp' && !user.verified;
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        constituency: user.constituency,
        token: isMpPending ? null : generateToken(user._id),
        isPending: isMpPending
      }
    });
  } else {
    throw new AppError('Invalid user data', 400);
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide an email and password', 400);
  }

  // select password explicitly since it has select: false in schema
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    if (user.role === 'mp' && !user.verified) {
      throw new AppError('Your MP account is pending administrator approval.', 403);
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        constituency: user.constituency,
        token: generateToken(user._id)
      }
    });
  } else {
    throw new AppError('Invalid email or password', 401);
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    success: true,
    data: user
  });
});

module.exports = {
  register,
  login,
  getMe
};

