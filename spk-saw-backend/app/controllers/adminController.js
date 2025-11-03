// app/controllers/adminController.js
// CRUD akun admins (id, username, password_hash, role)

const bcrypt = require('bcrypt');
const db = require('../../config/db');

// GET all admins (kembalikan ID, username, role saja)
exports.getAllAdmins = async(req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, role FROM admins ORDER BY id ASC');
        res.json(rows); // frontend mengharapkan array
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
        // Cek duplicate username
        const [exist] = await db.query('SELECT id FROM admins WHERE username = ?', [username]);
        if (exist.length) {
            return res.status(400).json({ message: 'Username sudah digunakan.' });
        }

        const hash = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)', [username, hash, role]);
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
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            await db.query('UPDATE admins SET username=?, password_hash=?, role=? WHERE id=?', [username, hash, role, id]);
        } else {
            await db.query('UPDATE admins SET username=?, role=? WHERE id=?', [username, role, id]);
        }
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
        await db.query('DELETE FROM admins WHERE id = ?', [id]);
        res.json({ message: 'Admin berhasil dihapus.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal menghapus admin.' });
    }
};