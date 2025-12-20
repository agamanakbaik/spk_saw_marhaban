/**
 * CONTROLLER: SubKriteriaController.js
 * Menangani logika permintaan untuk data Sub Kriterias PER USER.
 */
const SubKriteriaModel = require('../models/SubKriteriaModel');

// 1. GET By Kriteria ID (Filter)
exports.getSubKriteriasByKriteria = async(req, res) => {
    const { kriteria_id } = req.query;
    const adminId = req.user.id;

    if (!kriteria_id) {
        return res.status(400).json({
            message: "Parameter 'kriteria_id' wajib disertakan dalam query."
        });
    }

    try {
        const subKriterias = await SubKriteriaModel.findByKriteriaId(kriteria_id, adminId);
        res.status(200).json(subKriterias);
    } catch (error) {
        console.error("Error in getSubKriteriasByKriteria:", error);
        res.status(500).json({ message: error.message });
    }
};

// 2. GET ALL (Ini yang tadi hilang!)
exports.getAllSubKriterias = async(req, res) => {
    try {
        const adminId = req.user.id;
        const subKriterias = await SubKriteriaModel.findAll(adminId);
        res.status(200).json(subKriterias);
    } catch (error) {
        console.error("Error in getAllSubKriterias:", error);
        res.status(500).json({ message: error.message });
    }
};

// 3. GET BY ID
exports.getSubKriteriaById = async(req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;

    try {
        const subKriteria = await SubKriteriaModel.findById(id, adminId);

        if (!subKriteria) {
            return res.status(404).json({ message: "Sub Kriteria tidak ditemukan." });
        }

        res.status(200).json(subKriteria);
    } catch (error) {
        console.error("Error in getSubKriteriaById:", error);
        res.status(500).json({ message: error.message });
    }
};

// 4. CREATE
exports.createSubKriteria = async(req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Data JSON tidak ditemukan." });
    }

    const { kriteria_id, nama, nilai, keterangan } = req.body;
    const adminId = req.user.id;

    if (!kriteria_id || !nama || nilai === undefined) {
        return res.status(400).json({ message: "Semua kolom (kriteria_id, nama, nilai) wajib diisi." });
    }

    const cleanNilai = parseFloat(nilai);
    if (isNaN(cleanNilai) || cleanNilai <= 0) {
        return res.status(400).json({ message: "Nilai harus angka positif." });
    }

    try {
        const newSubKriteria = await SubKriteriaModel.create(adminId, kriteria_id, nama, cleanNilai, keterangan);
        res.status(201).json({ message: "Sub Kriteria berhasil ditambahkan.", data: newSubKriteria });
    } catch (error) {
        console.error("Error in createSubKriteria:", error.message);
        res.status(400).json({ message: error.message });
    }
};

// 5. UPDATE
exports.updateSubKriteria = async(req, res) => {
    const { id } = req.params;
    const { nama, nilai, keterangan } = req.body;
    const adminId = req.user.id;

    if (!nama || nilai === undefined) {
        return res.status(400).json({ message: "Nama dan nilai wajib diisi." });
    }

    const cleanNilai = parseFloat(nilai);
    if (isNaN(cleanNilai) || cleanNilai <= 0) {
        return res.status(400).json({ message: "Nilai harus angka positif." });
    }

    try {
        const updatedSubKriteria = await SubKriteriaModel.update(id, adminId, nama, cleanNilai, keterangan);

        if (!updatedSubKriteria) {
            return res.status(404).json({ message: "Sub Kriteria tidak ditemukan." });
        }
        res.status(200).json({ message: "Sub Kriteria berhasil diperbarui.", data: updatedSubKriteria });
    } catch (error) {
        console.error("Error in updateSubKriteria:", error);
        res.status(500).json({ message: error.message });
    }
};

// 6. DELETE
exports.deleteSubKriteria = async(req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;

    try {
        const isDeleted = await SubKriteriaModel.delete(id, adminId);

        if (!isDeleted) {
            return res.status(404).json({ message: "Sub Kriteria tidak ditemukan." });
        }
        res.status(200).json({ message: "Sub Kriteria berhasil dihapus." });
    } catch (error) {
        console.error("Error in deleteSubKriteria:", error);
        res.status(500).json({ message: error.message });
    }
};