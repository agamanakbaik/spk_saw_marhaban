// app/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifySuperAdmin } = require('../middleware/authMiddleware');

// Semua route admin harus diautentikasi dan hanya superadmin
router.get('/', verifyToken, verifySuperAdmin, adminController.getAllAdmins);
router.post('/', verifyToken, verifySuperAdmin, adminController.createAdmin);
router.put('/:id', verifyToken, verifySuperAdmin, adminController.updateAdmin);
router.delete('/:id', verifyToken, verifySuperAdmin, adminController.deleteAdmin);

module.exports = router;