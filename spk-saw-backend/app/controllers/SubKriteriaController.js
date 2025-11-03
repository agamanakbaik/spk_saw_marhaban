/**
 * CONTROLLER: SubKriteriaController.js
 * Menangani logika permintaan untuk data Sub Kriterias (CRUD, GET All, GET by ID).
 */
const SubKriteriaModel = require('../models/SubKriteriaModel');

// ---------------------------
// [GET] /api/subkriteria?kriteria_id=...
// ---------------------------
exports.getSubKriteriasByKriteria = async(req, res) => {
    const { kriteria_id } = req.query;

    if (!kriteria_id) {
        return res.status(400).json({
            message: "Parameter 'kriteria_id' wajib disertakan dalam query untuk filter."
        });
    }

    try {
        const subKriterias = await SubKriteriaModel.findByKriteriaId(kriteria_id);
        res.status(200).json(subKriterias);
    } catch (error) {
        console.error("Error in getSubKriteriasByKriteria:", error);
        res.status(500).json({
            message: `Gagal memuat sub kriteria: ${error.message}`
        });
    }
};

// ---------------------------
// [GET] /api/subkriteria/all
// ---------------------------
exports.getAllSubKriterias = async(req, res) => {
    try {
        const subKriterias = await SubKriteriaModel.findAll();
        res.status(200).json(subKriterias);
    } catch (error) {
        console.error("Error in getAllSubKriterias:", error);
        res.status(500).json({ message: error.message });
    }
};

// ---------------------------
// [GET] /api/subkriteria/:id
// ---------------------------
exports.getSubKriteriaById = async(req, res) => {
    const { id } = req.params;

    try {
        const subKriteria = await SubKriteriaModel.findById(id);

        if (!subKriteria) {
            return res.status(404).json({ message: "Sub Kriteria tidak ditemukan." });
        }

        res.status(200).json(subKriteria);
    } catch (error) {
        console.error("Error in getSubKriteriaById:", error);
        res.status(500).json({ message: error.message });
    }
};

// ---------------------------
// [POST] /api/subkriteria
// ---------------------------
exports.createSubKriteria = async(req, res) => {
    // Penanganan error: Mencegah crash jika body undefined/kosong
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Data JSON (body) tidak ditemukan. Pastikan Content-Type: application/json." });
    }

    const { kriteria_id, nama, nilai } = req.body;

    if (!kriteria_id || !nama || nilai === undefined) {
        return res.status(400).json({ message: "Semua kolom (kriteria_id, nama, nilai) wajib diisi." });
    }

    const cleanNilai = parseFloat(nilai);
    if (isNaN(cleanNilai) || cleanNilai <= 0) {
        return res.status(400).json({ message: "Nilai harus angka positif." });
    }

    try {
        const newSubKriteria = await SubKriteriaModel.create(kriteria_id, nama, cleanNilai);
        res.status(201).json({ message: "Sub Kriteria berhasil ditambahkan.", data: newSubKriteria });
    } catch (error) {
        console.error("Error in createSubKriteria:", error.message);
        res.status(400).json({ message: error.message });
    }
};

// ---------------------------
// [PUT] /api/subkriteria/:id
// ---------------------------
exports.updateSubKriteria = async(req, res) => {
    // Penanganan error: Mencegah crash jika body undefined/kosong
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Data JSON (body) tidak ditemukan. Pastikan Content-Type: application/json." });
    }

    const { id } = req.params;
    const { nama, nilai } = req.body; // kriteria_id tidak di-update

    if (!nama || nilai === undefined) {
        return res.status(400).json({ message: "Nama dan nilai wajib diisi." });
    }

    const cleanNilai = parseFloat(nilai);
    if (isNaN(cleanNilai) || cleanNilai <= 0) {
        return res.status(400).json({ message: "Nilai harus angka positif." });
    }

    try {
        const updatedSubKriteria = await SubKriteriaModel.update(id, nama, cleanNilai);

        if (!updatedSubKriteria) {
            return res.status(404).json({ message: "Sub Kriteria tidak ditemukan." });
        }
        res.status(200).json({ message: "Sub Kriteria berhasil diperbarui.", data: updatedSubKriteria });
    } catch (error) {
        console.error("Error in updateSubKriteria:", error);
        res.status(500).json({ message: error.message });
    }
};

// ---------------------------
// [DELETE] /api/subkriteria/:id
// ---------------------------
exports.deleteSubKriteria = async(req, res) => {
    const { id } = req.params;

    try {
        const isDeleted = await SubKriteriaModel.delete(id);
        if (!isDeleted) {
            return res.status(404).json({ message: "Sub Kriteria tidak ditemukan." });
        }
        res.status(200).json({ message: "Sub Kriteria berhasil dihapus." });
    } catch (error) {
        console.error("Error in deleteSubKriteria:", error);
        res.status(500).json({ message: error.message });
    }
};