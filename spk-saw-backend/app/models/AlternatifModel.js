/**
 * MODEL: AlternatifModel.js
 */
const db = require('../../config/db');

exports.getAll = async(filterId) => {
    let sql;
    let params = [];

    // Karena Controller mode STRICT, filterId pasti akan terisi (ID Admin atau ID Superadmin pilihan).
    if (filterId) {
        // --- TAMPILKAN SPESIFIK ADMIN ---
        sql = 'SELECT * FROM alternatifs WHERE admin_id = ? ORDER BY id DESC';
        params = [filterId];
    } else {
        // --- JAGA-JAGA (GLOBAL VIEW) ---
        // Kode ini tidak akan tereksekusi jika Controller sudah Strict, 
        // tapi dibiarkan untuk keamanan database.
        sql = `
            SELECT alternatifs.*, admins.username as penginput 
            FROM alternatifs 
            LEFT JOIN admins ON alternatifs.admin_id = admins.id 
            ORDER BY alternatifs.id DESC
        `;
    }

    const [rows] = await db.query(sql, params);
    return rows;
};

exports.getById = async(id) => {
    const sql = 'SELECT * FROM alternatifs WHERE id = ?';
    const [rows] = await db.query(sql, [id]);
    return rows[0];
};

exports.create = async(adminId, data) => {
    const { kode_alternatif, nama_periode, deskripsi } = data;
    const sql = 'INSERT INTO alternatifs (admin_id, kode_alternatif, nama_periode, deskripsi) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [adminId, kode_alternatif, nama_periode, deskripsi]);
    return result;
};

exports.update = async(id, adminId, data, role) => {
    const { kode_alternatif, nama_periode, deskripsi } = data;
    let sql = 'UPDATE alternatifs SET kode_alternatif = ?, nama_periode = ?, deskripsi = ? WHERE id = ?';
    let params = [kode_alternatif, nama_periode, deskripsi, id];

    if (role !== 'superadmin') {
        sql += ' AND admin_id = ?';
        params.push(adminId);
    }
    const [result] = await db.query(sql, params);
    return result;
};

exports.delete = async(id, adminId, role) => {
    let sql = 'DELETE FROM alternatifs WHERE id = ?';
    let params = [id];

    if (role !== 'superadmin') {
        sql += ' AND admin_id = ?';
        params.push(adminId);
    }
    const [result] = await db.query(sql, params);
    return result;
};