/**
 * ROUTES: /api/kriteria
 */
const express = require('express');
const router = express.Router();
const kriteriaController = require('../controllers/KriteriaController');
const { verifyToken } = require('../middleware/authMiddleware');

// === DEBUGGING (Hapus nanti jika sudah fix) ===
console.log("Cek Fungsi Controller:", kriteriaController);
// Kalau muncul {}, berarti file Controller belum di-save atau salah export.

// Terapkan JWT Middleware
router.use(verifyToken);

// Rute GET & POST
router.route('/')
    .get(kriteriaController.getAllKriterias)
    .post(kriteriaController.createKriteria);

// Rute PUT & DELETE
router.route('/:id')
    .put(kriteriaController.updateKriteria)
    .delete(kriteriaController.deleteKriteria);

module.exports = router;