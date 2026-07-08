const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  submitRequest, 
  handleWhatsAppWebhook, 
  getMyRequests, 
  getMyStats,
  getRequestDetails,
  updateRequest,
  resubmitRequest,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
} = require('../controllers/citizenController');
const { getRequests } = require('../controllers/dashboardController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

// Allow photo and audio fields
const cpUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]);

// @desc    Get user's requests and stats
// @route   GET /api/citizen/my-requests
// @route   GET /api/citizen/my-stats
// @access  Private
router.get('/my-requests', protect, getMyRequests);
router.get('/my-stats', protect, getMyStats);

// @desc    Submit a new citizen request
// @route   POST /api/citizen/submit
// @access  Public (Optional Auth)
router.post('/submit', optionalProtect, cpUpload, submitRequest);
router.post('/requests', optionalProtect, cpUpload, submitRequest);
router.get('/requests', getRequests);

// @desc    WhatsApp Webhook triage portal (Twilio Webhook body payload)
// @route   POST /api/citizen/whatsapp
// @access  Public
router.post('/whatsapp', express.urlencoded({ extended: true }), handleWhatsAppWebhook);

// Single request management
router.get('/requests/:id', protect, getRequestDetails);
router.put('/requests/:id', protect, updateRequest);
router.post('/requests/:id/resubmit', protect, resubmitRequest);

// Notifications management
router.get('/notifications', protect, getMyNotifications);
router.patch('/notifications/:id/read', protect, markNotificationRead);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);

module.exports = router;
