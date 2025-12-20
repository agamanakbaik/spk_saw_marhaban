/**
 * MODEL: KriteriaModel.js
 * Menangani operasi CRUD Kriteria (Per User/Admin).
 */
const db = require('../../config/db');

class KriteriaModel {

    // READ: Mendapatkan kriteria MILIK USER TERTENTU
    static async findAll(adminId) {
        try {
            // Ubah Query: Tambahkan WHERE admin_id = ?
            const sql = "SELECT * FROM kriterias WHERE admin_id = ? ORDER BY kode ASC";
            const [rows] = await db.query(sql, [adminId]);
            return rows;
        } catch (error) {
            console.error("Error finding all Kriterias:", error);
            throw new Error("Gagal mengambil daftar kriteria.");
        }
    }

    // CREATE: Menambah kriteria dengan penanda PEMILIK (admin_id)
    static async create(adminId, kode, nama, bobot, tipe) {
        try {
            // Ubah Query: Masukkan admin_id ke dalam INSERT
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

    // UPDATE: Mengubah data kriteria MILIK USER TERTENTU
    static async update(id, adminId, nama, bobot, tipe) {
        try {
            // Ubah Query: Tambahkan AND admin_id = ? agar tidak mengedit punya orang lain
            const sql = "UPDATE kriterias SET nama = ?, bobot = ?, tipe = ? WHERE id = ? AND admin_id = ?";
            const [result] = await db.query(sql, [nama, bobot, tipe, id, adminId]);

            if (result.affectedRows === 0) {
                return null; // Kriteria tidak ditemukan atau bukan milik user ini
            }
            return { id, nama, bobot, tipe };
        } catch (error) {
            console.error("Error updating Kriteria:", error);
            throw new Error("Gagal memperbarui kriteria.");
        }
    }

    // DELETE: Menghapus kriteria MILIK USER TERTENTU
    static async delete(id, adminId) {
        try {
            // Ubah Query: Tambahkan AND admin_id = ?
            const sql = "DELETE FROM kriterias WHERE id = ? AND admin_id = ?";
            const [result] = await db.query(sql, [id, adminId]);

            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting Kriteria:", error);
            throw new Error("Gagal menghapus kriteria. Pastikan kriteria tidak sedang digunakan.");
        }
    }
}

module.exports = KriteriaModel;