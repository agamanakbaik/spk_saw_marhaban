/**
 * CONTROLLER: PerhitunganController.js
 * Menangani logika untuk menjalankan perhitungan SAW.
 */

// HAPUS SEMUA IMPOR MODEL LAMA
// GANTI DENGAN IMPOR MODEL PERHITUNGAN
const PerhitunganModel = require("../models/perhitunganModel");

/**
 * [POST] /api/perhitungan/hitung
 * Menjalankan seluruh proses perhitungan SAW.
 */
exports.hitungSaw = async (req, res) => {
    try {
        // ===========================================
        // LANGKAH 1: Panggil Model untuk melakukan SEMUA perhitungan
        // ===========================================
        // Model akan 'throw error' jika ada data yang kosong
        const results = await PerhitunganModel.calculateSAW();

        // ===========================================
        // LANGKAH 2: Kirim hasil perhitungan ke frontend
        // ===========================================
        res.status(200).json({
            message: "Perhitungan SAW berhasil",
            ...results // Kirim semua data dari 'results' (ranking, initialValues, dll.)
        });

    } catch (err) {
        console.error("Error saat menghitung SAW:", err);
        
        // Tangani error yang di-'throw' oleh Model
        if (err.message.includes("kosong") || err.message.includes("Total bobot kriteria adalah 0")) {
            // Ini adalah error 400 (Bad Request) karena data tidak lengkap
             res.status(400).json({ message: err.message });
        } else {
            // Ini adalah error 500 (Server Error)
             res.status(500).json({
                message: "Terjadi kesalahan di server saat perhitungan",
                error: err.message,
            });
        }
    }
};