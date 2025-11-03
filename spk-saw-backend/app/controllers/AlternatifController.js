/**
 * CONTROLLER: AlternatifController.js
 * Menangani CRUD data Alternatif (Periode Evaluasi)
 */

const db = require('../../config/db');

// 🔹 Ambil semua data alternatif
exports.getAllAlternatifs = async(req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM alternatifs ORDER BY id DESC');
        res.json({
            success: true,
            data: rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data alternatif.' });
    }
};

// 🔹 Tambah data alternatif
exports.createAlternatif = async(req, res) => {
    const { kode_alternatif, nama_periode, deskripsi } = req.body;
    if (!kode_alternatif || !nama_periode) {
        return res.status(400).json({ success: false, message: 'Kode dan Nama wajib diisi.' });
    }
    try {
        await db.query(
            'INSERT INTO alternatifs (kode_alternatif, nama_periode, deskripsi) VALUES (?, ?, ?)', [kode_alternatif, nama_periode, deskripsi || null]
        );
        res.json({ success: true, message: 'Alternatif berhasil ditambahkan.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal menambah alternatif.' });
    }
};

// 🔹 Update data alternatif
exports.updateAlternatif = async(req, res) => {
    const { id } = req.params;
    const { kode_alternatif, nama_periode, deskripsi } = req.body;
    try {
        await db.query(
            'UPDATE alternatifs SET kode_alternatif=?, nama_periode=?, deskripsi=? WHERE id=?', [kode_alternatif, nama_periode, deskripsi, id]
        );
        res.json({ success: true, message: 'Alternatif berhasil diperbarui.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui alternatif.' });
    }
};

// 🔹 Hapus data alternatif
exports.deleteAlternatif = async(req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM alternatifs WHERE id = ?', [id]);
        res.json({ success: true, message: 'Alternatif berhasil dihapus.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal menghapus alternatif.' });
    }
};