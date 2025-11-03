/**
 * ROUTES: /api/kriteria
 * Menangani CRUD untuk data Kriteria (Rasio Keuangan).
 */
const express = require('express');
const router = express.Router();
const kriteriaController = require('../controllers/KriteriaController');
const { verifyToken } = require('../middleware/authMiddleware');

// Terapkan JWT Middleware ke semua route
router.use(verifyToken);

// Rute utama untuk GET All dan POST (Create)
router.route('/')
    .get(kriteriaController.getAllKriterias)
    .post(kriteriaController.createKriteria);

// Rute spesifik untuk PUT (Update) dan DELETE
router.route('/:id')
    .put(kriteriaController.updateKriteria)
    .delete(kriteriaController.deleteKriteria);

module.exports = router;