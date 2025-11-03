/**
 * MODEL: KriteriaModel.js
 * Menangani semua operasi CRUD untuk tabel Kriterias (Bobot, Tipe, Nama).
 * Kriteria dalam konteks Evaluasi Keuangan Marhaban Parfum adalah Rasio Keuangan.
 */
const db = require('../../config/db');

class KriteriaModel {
    // READ: Mendapatkan semua kriteria
    static async findAll() {
        try {
            const [rows] = await db.query("SELECT * FROM kriterias ORDER BY kode ASC");
            return rows;
        } catch (error) {
            console.error("Error finding all Kriterias:", error);
            throw new Error("Gagal mengambil daftar kriteria.");
        }
    }

    // CREATE: Menambah kriteria baru
    static async create(kode, nama, bobot, tipe) {
        try {
            const sql = "INSERT INTO kriterias (kode, nama, bobot, tipe) VALUES (?, ?, ?, ?)";
            const [result] = await db.query(sql, [kode, nama, bobot, tipe]);
            return { id: result.insertId, kode, nama, bobot, tipe };
        } catch (error) {
            console.error("Error creating Kriteria:", error);
            // Memberi tahu jika terjadi duplikasi kode/nama
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error("Kode Kriteria atau Nama sudah ada.");
            }
            throw new Error("Gagal menambahkan kriteria baru.");
        }
    }

    // UPDATE: Mengubah data kriteria berdasarkan ID
    static async update(id, nama, bobot, tipe) {
        try {
            const sql = "UPDATE kriterias SET nama = ?, bobot = ?, tipe = ? WHERE id = ?";
            const [result] = await db.query(sql, [nama, bobot, tipe, id]);
            if (result.affectedRows === 0) {
                return null; // Kriteria tidak ditemukan
            }
            return { id, nama, bobot, tipe };
        } catch (error) {
            console.error("Error updating Kriteria:", error);
            throw new Error("Gagal memperbarui kriteria.");
        }
    }

    // DELETE: Menghapus kriteria berdasarkan ID
    static async delete(id) {
        try {
            const sql = "DELETE FROM kriterias WHERE id = ?";
            const [result] = await db.query(sql, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting Kriteria:", error);
            throw new Error("Gagal menghapus kriteria. Pastikan kriteria tidak sedang digunakan dalam penilaian.");
        }
    }


}

module.exports = KriteriaModel;