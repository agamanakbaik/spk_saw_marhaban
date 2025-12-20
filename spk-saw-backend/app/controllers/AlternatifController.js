/**
 * CONTROLLER: AlternatifController.js
 * Menangani CRUD data Alternatif (Periode Evaluasi) PER USER.
 */

// PENTING: Panggil Model, jangan db.query langsung di sini
const AlternatifModel = require('../models/AlternatifModel');

// 🔹 Ambil semua data alternatif milik user login
exports.getAllAlternatifs = async(req, res) => {
    try {
        const adminId = req.user.id; // Ambil ID dari Token
        const rows = await AlternatifModel.getAll(adminId);

        res.json({
            success: true,
            data: rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data alternatif.' });
    }
};

// 🔹 Tambah data alternatif untuk user login
exports.createAlternatif = async(req, res) => {
    const { kode_alternatif, nama_periode, deskripsi } = req.body;
    const adminId = req.user.id; // Ambil ID dari Token

    if (!kode_alternatif || !nama_periode) {
        return res.status(400).json({ success: false, message: 'Kode dan Nama wajib diisi.' });
    }

    try {
        // Kirim adminId dan body ke Model
        await AlternatifModel.create(adminId, req.body);
        res.json({ success: true, message: 'Alternatif berhasil ditambahkan.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal menambah alternatif.' });
    }
};

// 🔹 Update data alternatif milik user login
exports.updateAlternatif = async(req, res) => {
    const { id } = req.params;
    const { kode_alternatif, nama_periode, deskripsi } = req.body;
    const adminId = req.user.id; // Ambil ID dari Token

    try {
        // Kirim ID data, ID admin, dan data baru ke Model
        const result = await AlternatifModel.update(id, adminId, req.body);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Alternatif tidak ditemukan atau bukan milik Anda.' });
        }

        res.json({ success: true, message: 'Alternatif berhasil diperbarui.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui alternatif.' });
    }
};

// 🔹 Hapus data alternatif milik user login
exports.deleteAlternatif = async(req, res) => {
    const { id } = req.params;
    const adminId = req.user.id; // Ambil ID dari Token

    try {
        const result = await AlternatifModel.delete(id, adminId);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Alternatif tidak ditemukan atau bukan milik Anda.' });
        }

        res.json({ success: true, message: 'Alternatif berhasil dihapus.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal menghapus alternatif.' });
    }
};