const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route POST /api/auth/login untuk proses otentikasi
router.post('/login', authController.loginAdmin);

module.exports = router;