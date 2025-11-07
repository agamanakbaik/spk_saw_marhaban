// app/controllers/adminController.js
// CRUD akun admins (id, username, password_hash, role)

// Hapus 'bcrypt' dan 'db', ganti dengan 'AdminModel'
const AdminModel = require('../models/adminModel'); // Panggil Model (Koki)

// GET all admins
exports.getAllAdmins = async(req, res) => {
    try {
        // Panggil fungsi dari Model
        const rows = await AdminModel.findAll();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil data admin.' });
    }
};

// CREATE admin
exports.createAdmin = async(req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'username, password, role wajib diisi.' });
    }

    try {
        // Cek duplikat via Model
        const exist = await AdminModel.findByUsername(username);
        if (exist.length) {
            return res.status(400).json({ message: 'Username sudah digunakan.' });
  	   }

        // Buat admin via Model (kirim password mentah)
        await AdminModel.create(username, password, role);
        res.json({ message: 'Admin berhasil ditambahkan.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal menambahkan admin.' });
    }
};

// UPDATE admin (password opsional)
exports.updateAdmin = async(req, res) => {
    const id = req.params.id;
    const { username, password, role } = req.body;

    if (!username || !role) {
        return res.status(400).json({ message: 'username dan role wajib diisi.' });
    }

    try {
        // Update via Model
        // Model akan menangani logika 'if (password)'
        await AdminModel.update(id, username, password, role);
      	res.json({ message: 'Admin berhasil diperbarui.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengupdate admin.' });
    }
};

// DELETE admin
exports.deleteAdmin = async(req, res) => {
    const id = req.params.id;
    try {
        // Hapus via Model
        await AdminModel.deleteById(id);
        res.json({ message: 'Admin berhasil dihapus.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal menghapus admin.' });
    }
};