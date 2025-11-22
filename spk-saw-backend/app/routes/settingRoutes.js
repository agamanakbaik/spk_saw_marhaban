const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const upload = require('../middleware/uploadMiddleware');

// --- DEBUGGING ---
// Cek apakah controller terbaca. Jika outputnya "undefined", berarti import gagal.
console.log("Status Controller:", settingController); 

// Pastikan fungsi tersedia sebelum dipasang ke router
if (!settingController || !settingController.getBranding || !settingController.updateBranding) {
    console.error("FATAL ERROR: Fungsi Controller tidak ditemukan! Cek file settingController.js");
    process.exit(1); // Matikan server agar ketahuan errornya
}

// GET
router.get('/', settingController.getBranding);

// PUT
router.put('/', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'background', maxCount: 1 }
]), settingController.updateBranding);

module.exports = router;