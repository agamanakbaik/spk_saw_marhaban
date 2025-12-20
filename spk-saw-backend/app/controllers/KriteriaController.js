/**
 * CONTROLLER: KriteriaController.js
 */
const KriteriaModel = require('../models/KriteriaModel');

// 1. GET ALL
exports.getAllKriterias = async(req, res) => {
    try {
        const adminId = req.user.id;
        const kriterias = await KriteriaModel.findAll(adminId);
        res.status(200).json(kriterias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. CREATE
exports.createKriteria = async(req, res) => {
    const { kode, nama, bobot, tipe } = req.body;
    const adminId = req.user.id;

    if (!kode || !nama || !bobot || !tipe) {
        return res.status(400).json({ message: "Data tidak lengkap." });
    }

    try {
        const newKriteria = await KriteriaModel.create(adminId, kode, nama, parseFloat(bobot), tipe);
        res.status(201).json({ message: "Berhasil tambah kriteria", data: newKriteria });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 3. UPDATE
exports.updateKriteria = async(req, res) => {
    const { id } = req.params;
    const { nama, bobot, tipe } = req.body;
    const adminId = req.user.id;

    try {
        const updated = await KriteriaModel.update(id, adminId, nama, parseFloat(bobot), tipe);
        if (!updated) return res.status(404).json({ message: "Gagal update." });
        res.json({ message: "Berhasil update kriteria." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. DELETE
exports.deleteKriteria = async(req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;

    try {
        const deleted = await KriteriaModel.delete(id, adminId);
        if (!deleted) return res.status(404).json({ message: "Gagal hapus." });
        res.json({ message: "Berhasil hapus kriteria." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};