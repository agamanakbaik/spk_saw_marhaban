const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');
const { verifyToken } = require('../middleware/authMiddleware');

// Endpoint untuk AI Chatbot
// POST /api/chat
router.post('/', verifyToken, chatController.askChatbot);

module.exports = router;