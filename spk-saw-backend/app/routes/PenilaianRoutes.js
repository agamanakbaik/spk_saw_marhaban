/**
 * ROUTES: /api/penilaian
 * Menangani CRUD untuk data Penilaian (Matriks Xij).
 */
const express = require("express");
const router = express.Router();
const penilaianController = require("../controllers/PenilaianController");
const { verifyToken } = require("../middleware/authMiddleware"); // Pastikan path ini benar

// =======================================================
// === ENDPOINT BARU UNTUK UI 'SIMPAN SEMUA' DARI APP.JS ===
// =======================================================
// POST /api/penilaian/save-all
router.post("/save-all", verifyToken, penilaianController.saveAllPenilaian);

// =======================================================
// === RUTE-RUTE LAMA ANDA (DISIMPAN) ===
// =======================================================

// Rute utama untuk GET All dan POST (Create Batch lama)
router
    .route("/")
    .get(verifyToken, penilaianController.getAllPenilaians)
    .post(verifyToken, penilaianController.createOrUpdatePenilaian);

// Rute spesifik untuk PUT (Update Batch lama) dan DELETE
router
    .route("/:id")
    .put(verifyToken, penilaianController.createOrUpdatePenilaian) // Ini rute lama Anda
    .delete(verifyToken, penilaianController.deletePenilaian);

module.exports = router;