/**
 * CONTROLLER: AlternatifController.js
 * Menangani logika bisnis untuk data Alternatif (Periode Evaluasi).
 */
const AlternatifModel = require('../models/AlternatifModel');

// 1. GET ALL: Mengambil semua alternatif
exports.getAllAlternatifs = async(req, res) => {
    try {
        const alternatifs = await AlternatifModel.getAll();
        res.status(200).json({
            message: "Data alternatif berhasil diambil.",
            data: alternatifs
        });
    } catch (error) {
        console.error("Error mengambil alternatif:", error);
        res.status(500).json({ message: "Gagal mengambil data alternatif." });
    }
};

// 2. CREATE: Membuat alternatif baru
exports.createAlternatif = async(req, res) => {
    const { kode_alternatif, nama_periode, deskripsi } = req.body;

    if (!kode_alternatif || !nama_periode) {
        return res.status(400).json({ message: "Kode dan Nama Periode wajib diisi." });
    }

    try {
        await AlternatifModel.create({ kode_alternatif, nama_periode, deskripsi });
        res.status(201).json({ message: "Alternatif baru berhasil ditambahkan." });
    } catch (error) {
        console.error("Error menambahkan alternatif:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Kode Alternatif sudah ada." });
        }
        res.status(500).json({ message: "Gagal menambahkan alternatif." });
    }
};

// 3. UPDATE: Mengupdate alternatif
exports.updateAlternatif = async(req, res) => {
    const id = req.params.id;
    const { kode_alternatif, nama_periode, deskripsi } = req.body;

    try {
        const result = await AlternatifModel.update(id, { kode_alternatif, nama_periode, deskripsi });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Alternatif tidak ditemukan." });
        }
        res.status(200).json({ message: "Alternatif berhasil diperbarui." });
    } catch (error) {
        console.error("Error mengupdate alternatif:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Kode Alternatif sudah ada." });
        }
        res.status(500).json({ message: "Gagal memperbarui alternatif." });
    }
};

// 4. DELETE: Menghapus alternatif
exports.deleteAlternatif = async(req, res) => {
    const id = req.params.id;

    try {
        const result = await AlternatifModel.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Alternatif tidak ditemukan." });
        }
        res.status(200).json({ message: "Alternatif berhasil dihapus." });
    } catch (error) {
        console.error("Error menghapus alternatif:", error);
        res.status(500).json({ message: "Gagal menghapus alternatif." });
    }
};