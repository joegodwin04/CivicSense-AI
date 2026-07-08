const express = require('express');
const { handleChat } = require('../controllers/aiController');
const router = express.Router();

router.post('/chat', handleChat);

module.exports = router;
