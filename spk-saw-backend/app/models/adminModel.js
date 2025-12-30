// ==========================================
// MODEL ADMIN (app/models/adminModel.js)
// ==========================================
// Model ini bertugas berinteraksi langsung dengan tabel 'admins' di database.
// PENTING: Kolom password di database bernama 'password_hash'.

const db = require('../../config/db');
const bcrypt = require('bcryptjs'); // Library untuk enkripsi password

const AdminModel = {};

/**
 * 1. GET ALL ADMINS
 * Mengambil semua data admin (id, username, role) untuk ditampilkan di tabel manajemen.
 * Password tidak diambil demi keamanan.
 */
AdminModel.findAll = async() => {
    const [rows] = await db.query('SELECT id, username, role FROM admins ORDER BY id ASC');
    return rows;
};

/**
 * 2. FIND BY ID
 * Mencari detail 1 admin berdasarkan ID.
 * Digunakan saat ingin mengedit data atau verifikasi profil.
 * SELECT * akan mengambil kolom 'password_hash' yang dibutuhkan untuk verifikasi password lama.
 */
AdminModel.findById = async(id) => {
    const [rows] = await db.query('SELECT * FROM admins WHERE id = ?', [id]);
    return rows;
};

/**
 * 3. FIND BY USERNAME
 * Mencari admin berdasarkan username.
 * Digunakan untuk proses Login dan pengecekan duplikat saat registrasi.
 */
AdminModel.findByUsername = async(username) => {
    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    return rows;
};

/**
 * 4. CREATE ADMIN
 * Menambahkan admin baru ke database.
 * - Password di-hash (enkripsi) sebelum disimpan.
 * - Disimpan ke kolom 'password_hash'.
 */
AdminModel.create = async(username, password, role) => {
    const hash = await bcrypt.hash(password, 10);
    // PERBAIKAN: Menggunakan kolom 'password_hash'
    await db.query('INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)', [username, hash, role]);
};

/**
 * 5. UPDATE ADMIN (General)
 * Mengupdate data admin (bisa username, password, atau role).
 * Fungsi ini menangani dua kondisi:
 * A. Jika password diisi -> Update username, role, DAN password baru (di-hash).
 * B. Jika password kosong -> Hanya update username dan role (password lama tetap).
 */
AdminModel.update = async(id, username, password, role) => {
    if (password) {
        // Kondisi A: Update Password juga
        const hash = await bcrypt.hash(password, 10);
        // PERBAIKAN: Menggunakan kolom 'password_hash'
        await db.query('UPDATE admins SET username=?, password_hash=?, role=? WHERE id=?', [username, hash, role, id]);
    } else {
        // Kondisi B: Tanpa ganti password
        await db.query('UPDATE admins SET username=?, role=? WHERE id=?', [username, role, id]);
    }
};

/**
 * 6. UPDATE PROFILE (Khusus Edit Akun Sendiri)
 * Fungsi spesifik untuk fitur "Edit Akun Utama" atau "Ganti Password".
 * Sama seperti update biasa, tapi tidak mengubah Role.
 */
AdminModel.updateProfile = async(id, username, newPasswordHash) => {
    if (newPasswordHash) {
        // Jika user mengirim password baru yang sudah di-validasi & di-hash di controller
        // PERBAIKAN: Menggunakan kolom 'password_hash'
        await db.query('UPDATE admins SET username=?, password_hash=? WHERE id=?', [username, newPasswordHash, id]);
    } else {
        // Jika hanya ganti username
        await db.query('UPDATE admins SET username=? WHERE id=?', [username, id]);
    }
};

/**
 * 7. DELETE ADMIN
 * Menghapus data admin dari database berdasarkan ID.
 */
AdminModel.deleteById = async(id) => {
    await db.query('DELETE FROM admins WHERE id = ?', [id]);
};

// update password verifikasi 2 langkah
AdminModel.updateGatePassword = async(id, newGateHash) => {
    await db.query('UPDATE admins SET gate_password_hash = ? WHERE id = ?', [newGateHash, id]);
};

/**
 * 8. GET ALL EXCEPT SUPERADMIN
 * Khusus untuk dropdown filter di dashboard Superadmin.
 * Mengambil semua user kecuali yang rolenya 'superadmin'.
 */
AdminModel.findAllExceptSuperadmin = async() => {
    // Ambil id dan username saja, filter role != 'superadmin'
    const [rows] = await db.query("SELECT id, username FROM admins WHERE role != 'superadmin' ORDER BY username ASC");
    return rows;
};

module.exports = AdminModel;