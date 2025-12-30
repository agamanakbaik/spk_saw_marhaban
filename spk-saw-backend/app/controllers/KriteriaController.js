/**
 * CONTROLLER: KriteriaController.js
 * Bertugas mengatur alur data antara User (Frontend) dan Database (Model).
 * LOGIKA BARU: STRICT FILTERING (Superadmin wajib pilih Admin).
 */
const KriteriaModel = require('../models/KriteriaModel');

// 1. GET ALL (Ambil Semua Data)
exports.getAllKriterias = async(req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { filter_id } = req.query; // Tangkap ID dari dropdown frontend

        let finalFilterId;

        if (userRole === 'superadmin') {
            // --- LOGIKA STRICT ---
            // Jika Superadmin belum memilih admin (filter_id kosong),
            // kembalikan array kosong agar tampilan bersih.
            if (!filter_id) {
                return res.status(200).json([]);
            }
            finalFilterId = filter_id;
        } else {
            // Admin Biasa: Selalu filter punya sendiri
            finalFilterId = userId;
        }

        const kriterias = await KriteriaModel.findAll(finalFilterId);
        res.status(200).json(kriterias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. CREATE (Tambah Data)
exports.createKriteria = async(req, res) => {
    const { kode, nama, bobot, tipe, target_admin_id } = req.body;
    let ownerId = req.user.id;

    // Override ID jika Superadmin
    if (req.user.role === 'superadmin' && target_admin_id) {
        ownerId = target_admin_id;
    }

    if (!kode || !nama || !bobot || !tipe) {
        return res.status(400).json({ message: "Data tidak lengkap." });
    }

    try {
        const newKriteria = await KriteriaModel.create(ownerId, kode, nama, parseFloat(bobot), tipe);
        res.status(201).json({ message: "Berhasil tambah kriteria", data: newKriteria });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 3. UPDATE (Edit Data)
exports.updateKriteria = async(req, res) => {
    const { id } = req.params;
    const { nama, bobot, tipe } = req.body;
    const adminId = req.user.id;
    const userRole = req.user.role;

    try {
        const updated = await KriteriaModel.update(id, adminId, nama, parseFloat(bobot), tipe, userRole);

        if (!updated) return res.status(404).json({ message: "Gagal update. Data tidak ditemukan atau bukan milik Anda." });

        res.json({ message: "Berhasil update kriteria." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. DELETE (Hapus Data)
exports.deleteKriteria = async(req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;
    const userRole = req.user.role;

    try {
        const deleted = await KriteriaModel.delete(id, adminId, userRole);

        if (!deleted) return res.status(404).json({ message: "Gagal hapus. Data tidak ditemukan atau bukan milik Anda." });

        res.json({ message: "Berhasil hapus kriteria." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};