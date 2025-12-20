/**
 * CONTROLLER: PenilaianController.js
 * Menangani logika HTTP untuk Penilaian Alternatif PER USER.
 */
const PenilaianModel = require("../models/PenilaianModel");

// [READ] Mendapatkan semua penilaian milik USER LOGIN
exports.getAllPenilaians = async(req, res) => {
    try {
        const adminId = req.user.id; // Ambil ID Admin
        const data = await PenilaianModel.getAll(adminId);
        res.status(200).json({
            message: "Semua data penilaian Anda berhasil diambil.",
            data: data,
        });
    } catch (error) {
        console.error("Error in getAllPenilaians:", error);
        res.status(500).json({ message: error.message });
    }
};

// [CREATE/UPDATE BATCH] Simpan semua nilai dari tabel input
exports.saveAllPenilaian = async(req, res) => {
    const penilaianData = req.body;
    const adminId = req.user.id; // Ambil ID Admin

    if (!Array.isArray(penilaianData) || penilaianData.length === 0) {
        return res.status(400).json({ message: "Data penilaian kosong." });
    }

    try {
        // Kirim adminId ke Model
        const affectedRows = await PenilaianModel.saveAll(adminId, penilaianData);

        res.status(201).json({
            message: `Berhasil menyimpan ${affectedRows} data penilaian.`,
            data: { count: affectedRows },
        });
    } catch (error) {
        console.error("Error in saveAllPenilaian:", error);
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] Hapus penilaian (Pastikan milik user sendiri)
exports.deletePenilaian = async(req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;

    try {
        const affectedRows = await PenilaianModel.deleteById(id, adminId);

        if (affectedRows === 0) {
            return res.status(404).json({ message: "Data tidak ditemukan atau bukan milik Anda." });
        }

        res.status(200).json({ message: "Data penilaian berhasil dihapus." });
    } catch (error) {
        console.error("Error in deletePenilaian:", error);
        res.status(500).json({ message: error.message });
    }
};