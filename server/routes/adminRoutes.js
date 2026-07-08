const express = require('express');
const {
  getAdminStats,
  getAllUsers,
  verifyMP,
  rejectMP,
  deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection and admin authorization to all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/verify-mp/:id', verifyMP);
router.delete('/reject-mp/:id', rejectMP);
router.delete('/users/:id', deleteUser);

module.exports = router;
