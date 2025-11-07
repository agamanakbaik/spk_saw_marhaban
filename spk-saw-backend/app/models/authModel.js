// app/models/authModel.js
// Bertanggung jawab mencari user, validasi password, dan generate token

const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Ambil secret dari environment
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_ANDA_YANG_SANGAT_RAHASIA';

const AuthModel = {};

AuthModel.login = async (username, password) => {
    // 1. Cari user di database
    const [rows] = await db.query(
        'SELECT id, username, password_hash, role FROM admins WHERE username = ?', [username]
    );

    // 2. Cek apakah user ada
    if (rows.length === 0) {
        // 'throw' error agar bisa ditangkap 'catch' di Controller
        throw new Error('Username atau password salah.');
    }

    const user = rows[0];

    // 3. Verifikasi password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        // 'throw' error yang sama (untuk keamanan)
        throw new Error('Username atau password salah.');
    }

    // 4. Generate JWT
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET, 
        { expiresIn: '1h' }
    );

    // 5. Kembalikan data yang dibutuhkan Controller
    return {
        user: { id: user.id, username: user.username, role: user.role },
        token
    };
};

module.exports = AuthModel;