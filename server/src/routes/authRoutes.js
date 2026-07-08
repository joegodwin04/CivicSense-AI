const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { AppError } = require('../middlewares/errorMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, role, constituency } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Please provide name, email and password', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('A user with that email already exists', 409);
    }

    const user = await User.create({ name, email, password, role, constituency });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  })
);

// @desc    Login and receive a JWT
// @route   POST /api/auth/login
// @access  Public
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  })
);

// @desc    Get the currently logged-in user
// @route   GET /api/auth/me
// @access  Private
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: req.user });
  })
);

module.exports = router;
