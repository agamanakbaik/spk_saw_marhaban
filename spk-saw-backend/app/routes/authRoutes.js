// app/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware'); // Import middleware

// 1. Endpoint LOGIN (Public - Siapa saja bisa akses)
router.post('/login', authController.login);

// 2. Endpoint UPDATE PROFIL (Protected - Harus ada Token)
// Digunakan untuk ganti username atau password sendiri
router.put('/profile', verifyToken, authController.updateProfile);
// verifikasi 2 langkah
router.post('/verify-password', verifyToken, authController.verifyPassword);
//ganti password verifikasi 2 langkah
router.put('/change-gate-password', verifyToken, authController.changeGatePassword);

module.exports = router;