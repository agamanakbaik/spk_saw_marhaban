/**
 * MODEL: AlternatifModel.js
 * Bertanggung jawab untuk berinteraksi dengan tabel 'alternatifs' di database.
 * SUDAH DIPERBARUI: Mendukung Multi-User (Filter by admin_id).
 */
const db = require('../../config/db');

// Fungsi untuk mengambil semua data alternatif MILIK USER LOGIN
exports.getAll = async(adminId) => {
    // Tambahkan WHERE admin_id = ?
    const sql = 'SELECT * FROM alternatifs WHERE admin_id = ? ORDER BY id DESC';
    const [rows] = await db.query(sql, [adminId]);
    return rows;
};

// Fungsi untuk mengambil satu alternatif berdasarkan ID dan User
exports.getById = async(id, adminId) => {
    const sql = 'SELECT * FROM alternatifs WHERE id = ? AND admin_id = ?';
    const [rows] = await db.query(sql, [id, adminId]);
    return rows[0];
};

// Fungsi untuk membuat alternatif baru dengan ADMIN_ID
exports.create = async(adminId, data) => {
    const { kode_alternatif, nama_periode, deskripsi } = data;
    // Masukkan admin_id ke dalam INSERT
    const sql = 'INSERT INTO alternatifs (admin_id, kode_alternatif, nama_periode, deskripsi) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [adminId, kode_alternatif, nama_periode, deskripsi]);
    return result;
};

// Fungsi untuk mengupdate alternatif (Hanya jika milik user tersebut)
exports.update = async(id, adminId, data) => {
    const { kode_alternatif, nama_periode, deskripsi } = data;
    // Tambahkan AND admin_id = ? untuk keamanan
    const sql = 'UPDATE alternatifs SET kode_alternatif = ?, nama_periode = ?, deskripsi = ? WHERE id = ? AND admin_id = ?';
    const [result] = await db.query(sql, [kode_alternatif, nama_periode, deskripsi, id, adminId]);
    return result;
};

// Fungsi untuk menghapus alternatif (Hanya jika milik user tersebut)
exports.delete = async(id, adminId) => {
    // Tambahkan AND admin_id = ?
    const sql = 'DELETE FROM alternatifs WHERE id = ? AND admin_id = ?';
    const [result] = await db.query(sql, [id, adminId]);
    return result;
};