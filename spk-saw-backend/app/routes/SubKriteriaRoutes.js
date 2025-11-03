/**
 * ROUTES: /api/subkriteria
 * Menangani CRUD dan READ tambahan untuk data Sub Kriteria.
 */
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser'); // Diperlukan untuk POST/PUT

const SubKriteriaController = require('../controllers/SubKriteriaController');
const { verifyToken } = require('../middleware/authMiddleware');

// 🔐 Terapkan JWT Middleware ke semua route
router.use(verifyToken);

// ----------------------------------------------------
// 1. RUTE GET ALL
// ----------------------------------------------------
// GET /api/subkriteria/all - Mendapatkan SEMUA sub kriteria.
router.get('/all', SubKriteriaController.getAllSubKriterias);


// ----------------------------------------------------
// 2. RUTE UTAMA (GET by kriteria_id & POST Create)
// ----------------------------------------------------
router.route('/')
    // GET /api/subkriteria?kriteria_id=... (Filter per kriteria)
    .get(SubKriteriaController.getSubKriteriasByKriteria)
    // POST /api/subkriteria (CREATE, dengan inline body-parser untuk jaminan req.body)
    .post(bodyParser.json(), SubKriteriaController.createSubKriteria);


// ----------------------------------------------------
// 3. RUTE SPESIFIK (GET by ID, PUT Update, DELETE)
// ----------------------------------------------------
router.route('/:id')
    // GET /api/subkriteria/:id (READ by ID)
    .get(SubKriteriaController.getSubKriteriaById)
    // PUT /api/subkriteria/:id (UPDATE, dengan inline body-parser)
    .put(bodyParser.json(), SubKriteriaController.updateSubKriteria)
    // DELETE /api/subkriteria/:id
    .delete(SubKriteriaController.deleteSubKriteria);

module.exports = router;