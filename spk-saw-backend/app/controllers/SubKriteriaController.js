/**
 * CONTROLLER: SubKriteriaController.js
 * Menangani logika permintaan untuk data Sub Kriterias.
 * UPDATED: Support Strict Filtering Superadmin.
 */
const SubKriteriaModel = require('../models/SubKriteriaModel');

// 1. GET By Kriteria ID (Filter)
exports.getSubKriteriasByKriteria = async(req, res) => {
    const { kriteria_id, filter_id } = req.query; // Tangkap filter_id dari URL (khusus Superadmin)
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!kriteria_id) {
        return res.status(400).json({
            message: "Parameter 'kriteria_id' wajib disertakan dalam query."
        });
    }

    try {
        let targetAdminId;

        // --- LOGIKA STRICT SUPERADMIN ---
        if (userRole === 'superadmin') {
            // Jika Superadmin belum pilih admin (filter_id kosong), return kosong
            if (!filter_id) {
                return res.status(200).json([]); // Array kosong
            }
            targetAdminId = filter_id;
        } else {
            // Admin Biasa: Selalu pakai ID sendiri
            targetAdminId = userId;
        }

        const subKriterias = await SubKriteriaModel.findByKriteriaId(kriteria_id, targetAdminId);
        res.status(200).json(subKriterias);
    } catch (error) {
        console.error("Error in getSubKriteriasByKriteria:", error);
        res.status(500).json({ message: error.message });
    }
};

// 2. GET ALL (Jarang dipakai langsung, biasanya by kriteria_id)
exports.getAllSubKriterias = async(req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { filter_id } = req.query;

        let targetAdminId;

        if (userRole === 'superadmin') {
            if (!filter_id) return res.status(200).json([]);
            targetAdminId = filter_id;
        } else {
            targetAdminId = userId;
        }

        const subKriterias = await SubKriteriaModel.findAll(targetAdminId);
        res.status(200).json(subKriterias);
    } catch (error) {
        console.error("Error in getAllSubKriterias:", error);
        res.status(500).json({ message: error.message });
    }
};

// 3. GET BY ID (Detail)
exports.getSubKriteriaById = async(req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // Kirim Role ke Model (Superadmin bisa lihat detail punya siapa aja)
        const subKriteria = await SubKriteriaModel.findById(id, userId, userRole);

        if (!subKriteria) {
            return res.status(404).json({ message: "Sub Kriteria tidak ditemukan." });
        }

        res.status(200).json(subKriteria);
    } catch (error) {
        console.error("Error in getSubKriteriaById:", error);
        res.status(500).json({ message: error.message });
    }
};

// 4. CREATE (Tambah Data)
exports.createSubKriteria = async(req, res) => {
    const { kriteria_id, nama, nilai, keterangan, target_admin_id } = req.body;
    let ownerId = req.user.id;

    // Override ID jika Superadmin
    if (req.user.role === 'superadmin' && target_admin_id) {
        ownerId = target_admin_id;
    }

    if (!kriteria_id || !nama || nilai === undefined) {
        return res.status(400).json({ message: "Semua kolom wajib diisi." });
    }

    const cleanNilai = parseFloat(nilai);
    if (isNaN(cleanNilai) || cleanNilai <= 0) {
        return res.status(400).json({ message: "Nilai harus angka positif." });
    }

    try {
        const newSubKriteria = await SubKriteriaModel.create(ownerId, kriteria_id, nama, cleanNilai, keterangan);
        res.status(201).json({ message: "Sub Kriteria berhasil ditambahkan.", data: newSubKriteria });
    } catch (error) {
        console.error("Error in createSubKriteria:", error.message);
        res.status(400).json({ message: error.message });
    }
};

// 5. UPDATE (Edit Data)
exports.updateSubKriteria = async(req, res) => {
    const { id } = req.params;
    const { nama, nilai, keterangan } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!nama || nilai === undefined) {
        return res.status(400).json({ message: "Nama dan nilai wajib diisi." });
    }

    const cleanNilai = parseFloat(nilai);
    if (isNaN(cleanNilai) || cleanNilai <= 0) {
        return res.status(400).json({ message: "Nilai harus angka positif." });
    }

    try {
        // Kirim Role ke Model: Superadmin bebas edit, Admin terkunci
        const updatedSubKriteria = await SubKriteriaModel.update(id, userId, nama, cleanNilai, keterangan, userRole);

        if (!updatedSubKriteria) {
            return res.status(404).json({ message: "Sub Kriteria tidak ditemukan atau bukan hak akses Anda." });
        }
        res.status(200).json({ message: "Sub Kriteria berhasil diperbarui.", data: updatedSubKriteria });
    } catch (error) {
        console.error("Error in updateSubKriteria:", error);
        res.status(500).json({ message: error.message });
    }
};

// 6. DELETE (Hapus Data)
exports.deleteSubKriteria = async(req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // Kirim Role ke Model
        const isDeleted = await SubKriteriaModel.delete(id, userId, userRole);

        if (!isDeleted) {
            return res.status(404).json({ message: "Sub Kriteria tidak ditemukan atau bukan hak akses Anda." });
        }
        res.status(200).json({ message: "Sub Kriteria berhasil dihapus." });
    } catch (error) {
        console.error("Error in deleteSubKriteria:", error);
        res.status(500).json({ message: error.message });
    }
};