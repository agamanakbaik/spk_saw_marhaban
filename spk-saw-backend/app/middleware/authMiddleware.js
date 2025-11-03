// app/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_ANDA_YANG_SANGAT_RAHASIA';

// Middleware yang memverifikasi JWT pada header Authorization: Bearer <token>
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak ditemukan.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Simpan decoded ke req.user untuk dipakai route lain
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token tidak valid atau kadaluarsa.' });
    }
};

// Middleware tambahan: hanya izinkan role 'superadmin'
exports.verifySuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        return next();
    }
    return res.status(403).json({ message: 'Akses ditolak. Hanya Super Admin.' });
};