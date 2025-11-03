// app/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// endpoint login untuk Admin & Super Admin
router.post('/login', authController.login);

module.exports = router;