/**
 * ROUTES: /api/penilaian
 * Menangani routing untuk Penilaian Alternatif.
 */
const express = require('express');
const router = express.Router();
const PenilaianController = require('../controllers/PenilaianController');
const { verifyToken } = require('../middleware/authMiddleware');

// === DEBUGGING (Hapus nanti jika sudah fix) ===
console.log("Cek Fungsi PenilaianController:", PenilaianController);

// Terapkan Middleware Auth
router.use(verifyToken);

// 1. GET ALL (Ambil data untuk ditampilkan di tabel)
router.get('/', PenilaianController.getAllPenilaians);

// 2. SAVE ALL (Simpan semua data dari tombol "Simpan Perubahan")
// Pastikan nama fungsi di controller adalah 'saveAllPenilaian'
router.post('/save-all', PenilaianController.saveAllPenilaian);

// 3. DELETE (Hapus satu baris penilaian)
router.delete('/:id', PenilaianController.deletePenilaian);

module.exports = router;