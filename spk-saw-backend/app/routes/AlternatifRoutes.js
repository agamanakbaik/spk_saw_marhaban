/**
 * ROUTES: /api/alternatif
 * Menangani CRUD untuk data Alternatif (Periode Evaluasi).
 */
const express = require('express');
const router = express.Router();
const alternatifController = require('../controllers/AlternatifController');
// PENTING: Pastikan Anda mengimpor middleware
const { verifyToken } = require('../middleware/authMiddleware');

// Rute utama untuk GET All dan POST (Create)
router.route('/')
    .get(verifyToken, alternatifController.getAllAlternatifs)
    .post(verifyToken, alternatifController.createAlternatif);


// Rute spesifik untuk GET (By ID), PUT (Update), dan DELETE
router.route('/:id')
    .put(verifyToken, alternatifController.updateAlternatif)
    .delete(verifyToken, alternatifController.deleteAlternatif);

module.exports = router;