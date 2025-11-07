// app/models/adminModel.js
// Bertanggung jawab atas semua query database & logika data untuk 'admins'

const db = require('../../config/db'); // Ambil koneksi database
const bcrypt = require('bcrypt'); // Pindahkan bcrypt ke model

const AdminModel = {};

// Fungsi untuk mengambil semua admin (hanya data yang aman)
AdminModel.findAll = async () => {
    // Hanya Model yang boleh menjalankan query
    const [rows] = await db.query('SELECT id, username, role FROM admins ORDER BY id ASC');
    return rows; // Kembalikan data mentah
};

// Fungsi untuk mencari admin berdasarkan username (untuk cek duplikat)
AdminModel.findByUsername = async (username) => {
    const [rows] = await db.query('SELECT id FROM admins WHERE username = ?', [username]);
    return rows; // Kembalikan array hasil
};

// Fungsi untuk membuat admin baru
AdminModel.create = async (username, password, role) => {
    // Logika hashing password sekarang ada di Model
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)', [username, hash, role]);
    // Tidak perlu mengembalikan apa-apa, controller akan kirim pesan sukses
};

// Fungsi untuk mengupdate admin
AdminModel.update = async (id, username, password, role) => {
    // Logika kondisional password juga pindah ke Model
    if (password) {
        const hash = await bcrypt.hash(password, 10);
        await db.query('UPDATE admins SET username=?, password_hash=?, role=? WHERE id=?', [username, hash, role, id]);
    } else {
        await db.query('UPDATE admins SET username=?, role=? WHERE id=?', [username, role, id]);
    }
};

// Fungsi untuk menghapus admin
AdminModel.deleteById = async (id) => {
    await db.query('DELETE FROM admins WHERE id = ?', [id]);
};

module.exports = AdminModel;