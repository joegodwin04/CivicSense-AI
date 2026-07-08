const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { submitRequest, handleWhatsAppWebhook } = require('../controllers/citizenController');
const { getRequests } = require('../controllers/dashboardController');

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

// @desc    Submit a new citizen request
// @route   POST /api/citizen/submit
// @access  Public
router.post('/submit', cpUpload, submitRequest);
router.post('/requests', cpUpload, submitRequest);
router.get('/requests', getRequests);

// @desc    WhatsApp Webhook triage portal (Twilio Webhook body payload)
// @route   POST /api/citizen/whatsapp
// @access  Public
router.post('/whatsapp', express.urlencoded({ extended: true }), handleWhatsAppWebhook);

module.exports = router;
