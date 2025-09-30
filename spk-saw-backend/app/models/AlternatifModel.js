/**
 * MODEL: AlternatifModel.js
 * Bertanggung jawab untuk berinteraksi dengan tabel 'alternatifs' di database.
 */
const db = require('../../config/db');

// --- PENTING: PASTIKAN TABEL ALTERNATIFS SUDAH DIBUAT ---
// Jika belum, jalankan query ini di phpMyAdmin Anda:
/*
CREATE TABLE alternatifs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_alternatif VARCHAR(10) NOT NULL UNIQUE,
    nama_periode VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

// Fungsi untuk mengambil semua data alternatif
exports.getAll = async() => {
    const sql = 'SELECT * FROM alternatifs ORDER BY id DESC';
    const [rows] = await db.query(sql);
    return rows;
};

// Fungsi untuk mengambil satu alternatif berdasarkan ID
exports.getById = async(id) => {
    const sql = 'SELECT * FROM alternatifs WHERE id = ?';
    const [rows] = await db.query(sql, [id]);
    return rows[0];
};

// Fungsi untuk membuat alternatif baru
exports.create = async(data) => {
    const { kode_alternatif, nama_periode, deskripsi } = data;
    const sql = 'INSERT INTO alternatifs (kode_alternatif, nama_periode, deskripsi) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [kode_alternatif, nama_periode, deskripsi]);
    return result;
};

// Fungsi untuk mengupdate alternatif
exports.update = async(id, data) => {
    const { kode_alternatif, nama_periode, deskripsi } = data;
    const sql = 'UPDATE alternatifs SET kode_alternatif = ?, nama_periode = ?, deskripsi = ? WHERE id = ?';
    const [result] = await db.query(sql, [kode_alternatif, nama_periode, deskripsi, id]);
    return result;
};

// Fungsi untuk menghapus alternatif
exports.delete = async(id) => {
    const sql = 'DELETE FROM alternatifs WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    return result;
};