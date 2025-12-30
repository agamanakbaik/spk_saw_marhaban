/**
 * CONTROLLER: PerhitunganController.js
 * Bertanggung jawab menangani request perhitungan dari User/Frontend.
 * LOGIKA: STRICT FILTERING (Superadmin wajib pilih target).
 */
const PerhitunganModel = require('../models/perhitunganModel');

exports.hitungSaw = async(req, res) => {
    try {
        const adminId = req.user.id;
        const userRole = req.user.role;
        const { filter_id } = req.query; // Tangkap ID dari dropdown

        let finalFilterId;

        if (userRole === 'superadmin') {
            // --- STRICT CHECK ---
            // Jika Superadmin tidak mengirim filter_id, tolak perhitungan.
            // Kita tidak ingin menghitung "Semua Data Global" karena hasilnya akan kacau.
            if (!filter_id) {
                return res.status(400).json({
                    success: false,
                    message: "Mohon pilih Admin target terlebih dahulu untuk melakukan perhitungan."
                });
            }
            finalFilterId = filter_id;
        } else {
            // Admin Biasa: Hitung data sendiri
            finalFilterId = adminId;
        }

        console.log(`[LOG] Memulai perhitungan SAW. Role: ${userRole}, Target ID: ${finalFilterId}`);

        // Panggil Model dengan ID yang sudah valid
        const hasil = await PerhitunganModel.calculateSAW(finalFilterId);

        res.status(200).json({
            success: true,
            message: "Perhitungan SAW berhasil diselesaikan.",
            data: hasil
        });

    } catch (error) {
        console.error("Error saat menghitung SAW:", error);

        if (error.message.includes("kosong") || error.message.includes("Total bobot")) {
            res.status(400).json({ success: false, message: error.message });
        } else {
            res.status(500).json({
                success: false,
                message: "Terjadi kesalahan server: " + error.message
            });
        }
    }
};