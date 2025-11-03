/**
 * CONTROLLER: KriteriaController.js
 * Menangani logika permintaan untuk data Kriterias (CRUD).
 */
const KriteriaModel = require('../models/KriteriaModel');


// [GET] /api/kriteria - Mendapatkan semua kriteria
exports.getAllKriterias = async(req, res) => {
    try {
        const kriterias = await KriteriaModel.findAll();
        res.status(200).json(kriterias);
    } catch (error) {
        console.error("Error in getAllKriterias:", error);
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/kriteria - Membuat kriteria baru
exports.createKriteria = async(req, res) => {
    const { kode, nama, bobot, tipe } = req.body;
    //const cleanBobot = parseFloat(parseFloat(bobot).toFixed(2));
    //const newKriteria = await KriteriaModel.create(kode, nama, cleanBobot, tipe);


    if (!kode || !nama || bobot === undefined || !tipe) {
        return res.status(400).json({ message: "Semua kolom (kode, nama, bobot, tipe) wajib diisi." });
    }

    // Validasi Tipe dan Bobot
    if (!['Benefit', 'Cost'].includes(tipe)) {
        return res.status(400).json({ message: "Tipe harus 'Benefit' atau 'Cost'." });
    }
    if (isNaN(bobot) || bobot <= 0) {
        return res.status(400).json({ message: "Bobot harus angka positif." });
    }

    try {
        const newKriteria = await KriteriaModel.create(kode, nama, parseFloat(bobot), tipe);    
        res.status(201).json({ message: "Kriteria berhasil ditambahkan.", data: newKriteria });  
    } catch (error) {    
        console.error("Error in createKriteria:", error.message);    
        res.status(400).json({ message: error.message });  
    }
};

// [PUT] /api/kriteria/:id - Memperbarui kriteria
exports.updateKriteria = async(req, res) => {
    const { id } = req.params;
    const { nama, bobot, tipe } = req.body;
    //const cleanBobot = parseFloat(parseFloat(bobot).toFixed(2));
    //const updatedKriteria = await KriteriaModel.update(id, nama, cleanBobot, tipe);

    if (!nama || bobot === undefined || !tipe) {
        return res.status(400).json({ message: "Nama, bobot, dan tipe wajib diisi." });
    }

    try {
        const updatedKriteria = await KriteriaModel.update(id, nama, parseFloat(bobot), tipe);    
        if (!updatedKriteria) {       return res.status(404).json({ message: "Kriteria tidak ditemukan." });     }    
        res.status(200).json({ message: "Kriteria berhasil diperbarui.", data: updatedKriteria });  
    } catch (error) {    
        console.error("Error in updateKriteria:", error);    
        res.status(500).json({ message: error.message });  
    }
};

// [DELETE] /api/kriteria/:id - Menghapus kriteria
exports.deleteKriteria = async(req, res) => {
    const { id } = req.params;

    try {
        const isDeleted = await KriteriaModel.delete(id);
        if (!isDeleted) {
            return res.status(404).json({ message: "Kriteria tidak ditemukan." });
        }
        res.status(200).json({ message: "Kriteria berhasil dihapus." });
    } catch (error) {
        console.error("Error in deleteKriteria:", error);
        res.status(500).json({ message: error.message });
    }
};