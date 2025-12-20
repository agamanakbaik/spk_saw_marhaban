/**
 * ROUTES: /api/subkriteria
 * Menangani CRUD Sub Kriteria.
 */
const express = require('express');
const router = express.Router();
const SubKriteriaController = require('../controllers/SubKriteriaController');
const { verifyToken } = require('../middleware/authMiddleware');

// === DEBUGGING (Cek apakah Controller terbaca dengan benar) ===
console.log("Cek SubKriteriaController:", SubKriteriaController);

// 🔐 WAJIB: Terapkan Middleware Auth ke semua route di bawah ini
// Ini yang membuat req.user.id tersedia di Controller
router.use(verifyToken);

// 1. GET ALL (Tanpa filter, opsi tambahan)
router.get('/all', SubKriteriaController.getAllSubKriterias);

// 2. RUTE UTAMA (GET by Query & POST)
router.route('/')
    // GET /api/subkriteria?kriteria_id=...
    .get(SubKriteriaController.getSubKriteriasByKriteria)
    // POST /api/subkriteria
    .post(SubKriteriaController.createSubKriteria);

// 3. RUTE SPESIFIK (GET One, PUT, DELETE)
router.route('/:id')
    .get(SubKriteriaController.getSubKriteriaById)
    .put(SubKriteriaController.updateSubKriteria)
    .delete(SubKriteriaController.deleteSubKriteria);

module.exports = router;