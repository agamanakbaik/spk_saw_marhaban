/**
 * CONTROLLER: authController.js
 * Menangani proses otentikasi (login) dan pendaftaran Admin.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const db = require('../../config/db'); // Mengakses koneksi database

/**
 * Fungsi untuk menangani proses login Admin.
 * Ini memverifikasi username dan password_hash menggunakan Bcrypt.
 */

//Ambil JWT Secret Key dari environment variable.
// PENTING: Ganti nilai default ini di file .env Anda!
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_ANDA_YANG_SANGAT_RAHASIA';
exports.loginAdmin = async(req, res) => {
    const { username, password } = req.body;

    // Pastikan username dan password tersedia
    if (!username || !password) {
        return res.status(400).json({
            message: "Username dan password wajib diisi."
        });
    }

    try {
        // 1. Cari user di database berdasarkan username
        const [users] = await db.query("SELECT id, username, password_hash, role FROM admins WHERE username = ?", [username]);

        if (users.length === 0) {
            // Menggunakan pesan generic untuk keamanan
            return res.status(401).json({
                message: "Username atau Password salah."
            });
        }

        const user = users[0];

        // 2. Verifikasi password menggunakan Bcrypt
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                message: "Username atau Password salah."
            });
        }

        // 3. Login Sukses
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role },
            JWT_SECRET, { expiresIn: '1h' } // Token berlaku selama 1 jam
        );

        // 4. Kirim Token JWT di Response
        res.json({
            message: "Login Berhasil!",
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            token: token // <--- TOKEN DIKIRIM DI SINI
        });


    } catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({
            message: "Terjadi kesalahan server saat proses login."
        });
    }
};

// TODO: Tambahkan fungsi register Admin di sini nanti