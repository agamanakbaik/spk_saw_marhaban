// app/controllers/adminController.js
const AdminModel = require('../models/adminModel');

// GET ALL
exports.getAllAdmins = async(req, res) => {
    try {
        const rows = await AdminModel.findAll();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil data admin.' });
    }
};

// CREATE (Hanya tambah Admin Biasa)
exports.createAdmin = async(req, res) => {
    const { username, password } = req.body; // HAPUS role dari input

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan Password wajib diisi.' });
    }

    try {
        // Cek duplikat
        const exist = await AdminModel.findByUsername(username);
        if (exist.length > 0) {
            return res.status(400).json({ message: 'Username sudah digunakan.' });
        }

        // HARDCODE ROLE 'admin'
        // Jadi Super Admin tidak perlu milih, yang ditambah pasti admin biasa.
        await AdminModel.create(username, password, 'admin');

        res.status(201).json({ message: 'Admin baru berhasil ditambahkan.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal menambahkan admin.' });
    }
};

// UPDATE (Super Admin edit user lain)
exports.updateAdmin = async(req, res) => {
    const id = req.params.id;
    const { username, password, role } = req.body;

    if (!username || !role) {
        return res.status(400).json({ message: 'Username dan Role wajib diisi.' });
    }

    try {
        await AdminModel.update(id, username, password, role);
        res.json({ message: 'Data admin berhasil diperbarui.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengupdate admin.' });
    }
};

// DELETE
exports.deleteAdmin = async(req, res) => {
    const id = req.params.id;
    try {
        await AdminModel.deleteById(id);
        res.json({ message: 'Admin berhasil dihapus.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal menghapus admin.' });
    }
};