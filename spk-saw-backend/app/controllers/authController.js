// app/controllers/authController.js
// Menangani proses login untuk semua akun pada table "admins".
// Mengembalikan token JWT yang berisi { id, username, role }.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_ANDA_YANG_SANGAT_RAHASIA';

exports.login = async(req, res) => {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }

    try {
        // Cari user (baik admin atau superadmin)
        const [rows] = await db.query(
            'SELECT id, username, password_hash, role FROM admins WHERE username = ?', [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const user = rows[0];

        // Verifikasi password
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        // Generate JWT (masukkan role supaya frontend/middleware bisa cek)
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role },
            JWT_SECRET, { expiresIn: '1h' }
        );

        // Kirim token + data user (frontend simpan di localStorage)
        res.json({
            message: 'Login berhasil.',
            user: { id: user.id, username: user.username, role: user.role },
            token
        });
    } catch (err) {
        console.error('authController.login error:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};