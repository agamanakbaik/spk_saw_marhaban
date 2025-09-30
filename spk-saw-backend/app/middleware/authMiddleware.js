/**
 * MIDDLEWARE: authMiddleware.js
 * Bertanggung jawab memverifikasi JSON Web Token (JWT)
 * dari header permintaan (Authorization: Bearer <token>)
 */
const jwt = require('jsonwebtoken');

// Secret key untuk JWT (harus sama dengan yang digunakan saat sign/login)
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_ANDA_YANG_SANGAT_RAHASIA';

exports.verifyToken = (req, res, next) => {
    // 1. Ambil token dari header "Authorization"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Akses ditolak. Token tidak ditemukan atau format tidak valid.'
        });
    }

    // Ekstrak token (hilangkan 'Bearer ')
    const token = authHeader.split(' ')[1];

    try {
        // 2. Verifikasi dan decode token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Simpan data user yang terdekode di objek request (req.user)
        req.user = decoded;

        // Lanjutkan ke controller berikutnya
        next();
    } catch (error) {
        // Error jika token kadaluarsa, rusak, atau tidak valid
        return res.status(403).json({
            message: 'Akses ditolak. Token tidak valid atau kadaluarsa.'
        });
    }
};

// Middleware untuk memverifikasi apakah user adalah Super Admin
exports.isAdmin = (req, res, next) => {
    // Memeriksa role yang disimpan saat token dibuat
    if (req.user && req.user.role === 'Super Admin') {
        next(); // Lanjutkan jika role adalah Super Admin
    } else {
        return res.status(403).json({
            message: 'Akses terlarang. Diperlukan hak akses Super Admin.'
        });
    }
};