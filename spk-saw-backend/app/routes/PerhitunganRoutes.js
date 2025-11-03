const express = require("express");
const router = express.Router();
const perhitunganController = require("../controllers/PerhitunganController");
const { verifyToken } = require("../middleware/authMiddleware");

// =======================================================
// === DISESUAIKAN AGAR COCOK DENGAN FRONTEND APP.JS ===
// =======================================================

// Endpoint untuk melakukan perhitungan SAW
// Frontend memanggil: POST /api/perhitungan/hitung
router.post("/hitung", verifyToken, perhitunganController.hitungSaw);

// Catatan: Saya menggunakan nama controller Anda yaitu 'hitungSaw' (huruf kecil 'h')
// Pastikan nama ini sama persis dengan nama fungsi di PerhitunganController.js Anda

module.exports = router;