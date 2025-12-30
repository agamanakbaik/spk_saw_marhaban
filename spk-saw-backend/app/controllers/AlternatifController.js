/**
 * CONTROLLER: AlternatifController.js
 * Menangani CRUD data Alternatif dengan Logika STRICT FILTERING.
 */

const AlternatifModel = require('../models/AlternatifModel');

// 🔹 Ambil data (Superadmin WAJIB Filter, Admin lihat sendiri)
exports.getAllAlternatifs = async(req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { filter_id } = req.query; // Tangkap input dropdown dari Frontend

        let finalFilterId;

        if (userRole === 'superadmin') {
            // --- LOGIKA STRICT SUPERADMIN ---
            // Jika Superadmin TIDAK mengirim filter_id (belum pilih admin),
            // Maka kembalikan array kosong (Jangan tampilkan data global).
            if (!filter_id) {
                return res.json({
                    success: true,
                    data: [], // Data Kosong
                    message: "Silakan pilih Admin terlebih dahulu untuk melihat data."
                });
            }
            // Jika ada pilihan, gunakan ID tersebut
            finalFilterId = filter_id;
        } else {
            // --- ADMIN BIASA ---
            // Paksa pakai ID sendiri (Keamanan)
            finalFilterId = userId;
        }

        // Panggil Model (Akan selalu masuk ke logika WHERE admin_id = ...)
        const rows = await AlternatifModel.getAll(finalFilterId);

        res.json({
            success: true,
            data: rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data alternatif.' });
    }
};

// 🔹 Tambah data (Selalu pakai ID si penginput)
exports.createAlternatif = async(req, res) => {
    const { kode_alternatif, nama_periode, deskripsi, target_admin_id } = req.body;
    let ownerId = req.user.id; // Default: Punya si penginput

    // JIKA SUPERADMIN ingin inputkan data untuk orang lain
    if (req.user.role === 'superadmin' && target_admin_id) {
        ownerId = target_admin_id;
    }

    if (!kode_alternatif || !nama_periode) {
        return res.status(400).json({ success: false, message: 'Kode dan Nama wajib diisi.' });
    }

    try {
        await AlternatifModel.create(ownerId, req.body);
        res.json({ success: true, message: 'Alternatif berhasil ditambahkan.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal menambah alternatif.' });
    }
};

// 🔹 Update data (Superadmin bisa edit punya siapa saja)
exports.updateAlternatif = async(req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;
    const userRole = req.user.role;

    try {
        const result = await AlternatifModel.update(id, adminId, req.body, userRole);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan atau Anda tidak berhak mengeditnya.' });
        }

        res.json({ success: true, message: 'Alternatif berhasil diperbarui.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui alternatif.' });
    }
};

// 🔹 Hapus data (Superadmin bisa hapus punya siapa saja)
exports.deleteAlternatif = async(req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;
    const userRole = req.user.role;

    try {
        const result = await AlternatifModel.delete(id, adminId, userRole);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan atau Anda tidak berhak menghapusnya.' });
        }

        res.json({ success: true, message: 'Alternatif berhasil dihapus.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal menghapus alternatif.' });
    }
};