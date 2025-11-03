// spk-saw-backend/app/routes/backupRoutes.js

const express = require('express');
const router = express.Router();
const backupController = require('../controllers/BackupController');
const { verifyToken } = require('../middleware/authMiddleware'); // Pastikan path ini benar

// Middleware untuk cek SuperAdmin di semua rute backup
const isSuperAdmin = (req, res, next) => {
    // Pastikan verifyToken menambahkan data user ke req.user
    if (!req.user || req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Akses ditolak. Hanya superadmin.' });
    }
    next();
};

// POST /api/backup/database - Membuat backup baru
router.post('/database', verifyToken, isSuperAdmin, backupController.createBackup);

// GET /api/backup - Mendapatkan daftar semua file backup
router.get('/', verifyToken, isSuperAdmin, backupController.listBackups);

// GET /api/backup/:filename - Mengunduh file backup spesifik
router.get('/:filename', verifyToken, isSuperAdmin, backupController.downloadBackup);

// DELETE /api/backup/:filename - Menghapus file backup spesifik
router.delete('/:filename', verifyToken, isSuperAdmin, backupController.deleteBackup);

module.exports = router;