/**
 * CONTROLLER: PenilaianController.js
 * Logika HTTP: STRICT FILTERING (Superadmin wajib pilih admin).
 */
const PenilaianModel = require("../models/PenilaianModel");

// [READ] Superadmin WAJIB pilih admin, Admin Biasa lihat sendiri
exports.getAllPenilaians = async(req, res) => {
    try {
        const adminId = req.user.id;
        const userRole = req.user.role;
        const { filter_id } = req.query; // Tangkap ID dari dropdown

        let finalFilterId;

        if (userRole === 'superadmin') {
            // --- STRICT MODE ---
            // Jika Superadmin belum memilih admin (filter_id kosong),
            // kembalikan data kosong agar dashboard bersih.
            if (!filter_id) {
                return res.status(200).json({
                    message: "Pilih admin terlebih dahulu untuk melihat penilaian.",
                    data: [],
                });
            }
            finalFilterId = filter_id;
        } else {
            // Admin Biasa: Selalu filter punya sendiri
            finalFilterId = adminId;
        }

        const data = await PenilaianModel.getAll(finalFilterId);

        res.status(200).json({
            message: "Data penilaian berhasil diambil.",
            data: data,
        });
    } catch (error) {
        console.error("Error in getAllPenilaians:", error);
        res.status(500).json({ message: error.message });
    }
};

// [SAVE BATCH] Simpan/Update Nilai (Superadmin bisa edit punya orang)
exports.saveAllPenilaian = async(req, res) => {
    const penilaianData = req.body;
    const adminId = req.user.id;
    const userRole = req.user.role; // PENTING: Kirim Role ke Model

    if (!Array.isArray(penilaianData) || penilaianData.length === 0) {
        return res.status(400).json({ message: "Data penilaian kosong." });
    }

    try {
        // Kirim adminId, data, DAN ROLE ke Model
        const affectedRows = await PenilaianModel.saveAll(adminId, penilaianData, userRole);

        res.status(201).json({
            message: `Berhasil menyimpan ${affectedRows} data penilaian.`,
            data: { count: affectedRows },
        });
    } catch (error) {
        console.error("Error in saveAllPenilaian:", error);
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] Hapus (Superadmin bisa hapus punya orang)
exports.deletePenilaian = async(req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;
    const userRole = req.user.role;

    try {
        const affectedRows = await PenilaianModel.deleteById(id, adminId, userRole);

        if (affectedRows === 0) {
            return res.status(404).json({ message: "Data tidak ditemukan atau bukan milik Anda." });
        }

        res.status(200).json({ message: "Data penilaian berhasil dihapus." });
    } catch (error) {
        console.error("Error in deletePenilaian:", error);
        res.status(500).json({ message: error.message });
    }
};