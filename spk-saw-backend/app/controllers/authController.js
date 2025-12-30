// app/controllers/authController.js
// Menangani proses login dan update profil user yang sedang login.

const AuthModel = require('../models/authModel');
const AdminModel = require('../models/adminModel'); // Kita butuh ini untuk ambil data user & update
const bcrypt = require('bcryptjs'); // Kita butuh ini untuk cek password lama

// 1. LOGIN (Fungsi Lama)
exports.login = async(req, res) => {
    const { username, password } = req.body;

    // 1. Validasi input (Tugas Controller)
    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }

    try {
        // 2. Panggil Model (Tugas Controller)
        // Model akan 'throw' error jika login gagal
        const result = await AuthModel.login(username, password);

        // 3. Kirim respons sukses (Tugas Controller)
        // 'result' berisi { user, token }
        res.json({
            message: 'Login berhasil.',
            ...result // kirim { user: {...}, token: '...' }
        });

    } catch (err) {
        // 4. Tangani error dari Model (Tugas Controller)
        console.error('authController.login error:', err);

        // Jika error-nya adalah 'Username atau password salah.', kirim 401
        if (err.message === 'Username atau password salah.') {
            return res.status(401).json({ message: err.message });
        }

        // Untuk error tak terduga lainnya (misal DB mati)
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// 2. UPDATE PROFILE (Fungsi Baru: Ganti Password/Username Sendiri)
exports.updateProfile = async(req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Diambil dari Token (lewat Middleware)

    try {
        // A. Cari data user saat ini di Database
        // Kita pakai AdminModel karena data user ada di tabel admins
        const users = await AdminModel.findById(userId);

        // Validasi jika user tidak ditemukan (aneh, tapi jaga-jaga)
        if (users.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }
        const currentUser = users[0];

        // B. Validasi Password Lama (Hanya jika user ingin ganti password)
        let newPasswordHash = null; // Default null jika tidak ganti password

        if (newPassword) {
            // 1. Cek apakah password lama diisi
            if (!oldPassword) {
                return res.status(400).json({ message: "Masukkan password lama untuk keamanan." });
            }
            // 2. Cek apakah password lama COCOK dengan database
            const isMatch = await bcrypt.compare(oldPassword, currentUser.password_hash);
            if (!isMatch) {
                return res.status(400).json({ message: "Password lama salah!" });
            }
            // 3. Hash password baru
            newPasswordHash = await bcrypt.hash(newPassword, 10);
        }

        // C. Update ke Database via Model
        // Kita panggil fungsi khusus di AdminModel yang sudah kita buat sebelumnya
        await AdminModel.updateProfile(userId, username, newPasswordHash);

        res.json({ message: "Profil berhasil diperbarui. Silakan login ulang jika mengganti password." });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat update profil." });
    }
};

//verifikasi 2 langkah
exports.verifyPassword = async(req, res) => {
    const { password } = req.body;
    const userId = req.user.id; // Dari token

    try {
        if (!password) return res.status(400).json({ message: "Password harus diisi." });

        // Ambil data user dari DB
        const users = await AdminModel.findById(userId);
        if (!users.length) return res.status(404).json({ message: "User tidak valid." });

        const user = users[0];

        // Cek Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Password salah!" });
        }

        // Jika benar
        res.json({ success: true, message: "Verifikasi berhasil." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

//update password verifikasi 2 langkah
exports.verifyPassword = async(req, res) => {
    const { password } = req.body;
    const userId = req.user.id;

    try {
        const users = await AdminModel.findById(userId);
        const user = users[0];

        // Gunakan gate_password_hash jika ada, jika tidak gunakan password_hash login
        const passwordToCompare = user.gate_password_hash || user.password_hash;

        const isMatch = await bcrypt.compare(password, passwordToCompare);
        if (!isMatch) return res.status(401).json({ message: "Password salah!" });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

//ganti password verifikasi 2 langkah
exports.changeGatePassword = async(req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const users = await AdminModel.findById(userId);
        const user = users[0];

        // Verifikasi password lama (bisa gate pass lama atau login pass jika baru pertama kali)
        const passwordToCompare = user.gate_password_hash || user.password_hash;
        const isMatch = await bcrypt.compare(oldPassword, passwordToCompare);

        if (!isMatch) return res.status(401).json({ message: "Password lama salah!" });

        // Hash password baru dan simpan
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        await AdminModel.updateGatePassword(userId, newHash);
        res.json({ message: "Password Area Terbatas berhasil diperbarui!" });
    } catch (err) {
        res.status(500).json({ message: "Gagal memperbarui password." });
    }
};

exports.getListAdmin = async(req, res) => {
    try {
        // Panggil fungsi model yang baru kita buat di atas
        const rows = await AdminModel.findAllExceptSuperadmin();

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Gagal ambil list admin:", error);
        res.status(500).json({ message: error.message });
    }
};