/**
 * CONTROLLER: PerhitunganController.js
 * Menangani logika untuk menjalankan perhitungan SAW PER USER.
 */
const PerhitunganModel = require("../models/perhitunganModel");

/**
 * [POST] /api/perhitungan/hitung
 * Menjalankan seluruh proses perhitungan SAW untuk User Login.
 */
exports.hitungSaw = async(req, res) => {
    try {
        // 1. Ambil ID Admin dari Token
        const adminId = req.user.id;

        // 2. Panggil Model dengan adminId
        const results = await PerhitunganModel.calculateSAW(adminId);

        // 3. Kirim hasil
        res.status(200).json({
            message: "Perhitungan SAW berhasil",
            ...results
        });

    } catch (err) {
        console.error("Error saat menghitung SAW:", err);

        if (err.message.includes("kosong") || err.message.includes("Total bobot")) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(500).json({
                message: "Terjadi kesalahan di server saat perhitungan",
                error: err.message,
            });
        }
    }
};