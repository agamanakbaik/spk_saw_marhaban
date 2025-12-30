/**
 * MODEL: KriteriaModel.js
 * Menangani operasi Database untuk Tabel KRITERIA.
 */
const db = require('../../config/db');

class KriteriaModel {

    // READ: Ambil semua kriteria (Filtered)
    static async findAll(filterId) {
        try {
            let sql;
            let params = [];

            // Karena Controller mode STRICT, filterId pasti terisi saat sampai di sini.
            if (filterId) {
                // --- TAMPILKAN SPESIFIK ADMIN ---
                sql = "SELECT * FROM kriterias WHERE admin_id = ? ORDER BY kode ASC";
                params = [filterId];
            } else {
                // --- JAGA-JAGA (GLOBAL VIEW) ---
                // Kode ini hanya fallback jika strict mode di controller dimatikan.
                sql = `
                    SELECT kriterias.*, admins.username as penginput 
                    FROM kriterias 
                    LEFT JOIN admins ON kriterias.admin_id = admins.id 
                    ORDER BY kriterias.kode ASC
                `;
            }

            const [rows] = await db.query(sql, params);
            return rows;
        } catch (error) {
            console.error("Error finding all Kriterias:", error);
            throw new Error("Gagal mengambil daftar kriteria.");
        }
    }

    // CREATE: Tambah Kriteria
    static async create(adminId, kode, nama, bobot, tipe) {
        try {
            const sql = "INSERT INTO kriterias (admin_id, kode, nama, bobot, tipe) VALUES (?, ?, ?, ?, ?)";
            const [result] = await db.query(sql, [adminId, kode, nama, bobot, tipe]);

            return { id: result.insertId, adminId, kode, nama, bobot, tipe };
        } catch (error) {
            console.error("Error creating Kriteria:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error("Kode Kriteria sudah ada di akun ini.");
            }
            throw new Error("Gagal menambahkan kriteria baru.");
        }
    }

    // UPDATE: Edit Kriteria (Cek Role)
    static async update(id, adminId, nama, bobot, tipe, role) {
        try {
            let sql = "UPDATE kriterias SET nama = ?, bobot = ?, tipe = ? WHERE id = ?";
            let params = [nama, bobot, tipe, id];

            if (role !== 'superadmin') {
                sql += " AND admin_id = ?";
                params.push(adminId);
            }

            const [result] = await db.query(sql, params);

            if (result.affectedRows === 0) {
                return null;
            }
            return { id, nama, bobot, tipe };
        } catch (error) {
            console.error("Error updating Kriteria:", error);
            throw new Error("Gagal memperbarui kriteria.");
        }
    }

    // DELETE: Hapus Kriteria (Cek Role)
    static async delete(id, adminId, role) {
        try {
            let sql = "DELETE FROM kriterias WHERE id = ?";
            let params = [id];

            if (role !== 'superadmin') {
                sql += " AND admin_id = ?";
                params.push(adminId);
            }

            const [result] = await db.query(sql, params);

            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting Kriteria:", error);
            throw new Error("Gagal menghapus kriteria. Pastikan kriteria tidak sedang digunakan.");
        }
    }
}

module.exports = KriteriaModel;