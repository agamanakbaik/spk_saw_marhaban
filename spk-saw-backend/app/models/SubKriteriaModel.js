/**
 * MODEL: SubKriteriaModel.js
 * Menangani operasi CRUD untuk tabel sub_kriterias.
 */
const db = require('../../config/db');

class SubKriteriaModel {

    // 🆕 READ: Mendapatkan SEMUA sub kriteria (untuk endpoint /api/subkriteria/all)
    static async findAll() {
        try {
            const sql = "SELECT id, kriteria_id, nama, nilai FROM sub_kriterias ORDER BY kriteria_id ASC, nilai DESC";
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            console.error("Error finding all SubKriterias:", error);
            throw new Error("Gagal mengambil semua daftar sub kriteria.");
        }
    }

    // 🆕 READ: Mendapatkan sub kriteria berdasarkan ID Kriteria (untuk endpoint /api/subkriteria?kriteria_id=...)
    static async findByKriteriaId(kriteriaId) {
        try {
            const sql = "SELECT id, kriteria_id, nama, nilai FROM sub_kriterias WHERE kriteria_id = ? ORDER BY nilai DESC";
            const [rows] = await db.query(sql, [kriteriaId]);
            return rows;
        } catch (error) {
            console.error("Error finding SubKriterias by Kriteria ID:", error);
            throw new Error("Gagal mengambil daftar sub kriteria dari DB.");
        }
    }

    // CREATE: Menambah sub kriteria baru
    static async create(kriteria_id, nama, nilai) {
        try {
            const sql = "INSERT INTO sub_kriterias (kriteria_id, nama, nilai) VALUES (?, ?, ?)";
            const [result] = await db.query(sql, [kriteria_id, nama, nilai]);
            return { id: result.insertId, kriteria_id, nama, nilai };
        } catch (error) {
            console.error("Error creating SubKriteria:", error);
            // Tambahkan penanganan error duplikasi jika ada UNIQUE constraint
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error("Sub Kriteria atau Nilai pada kriteria ini sudah ada.");
            }
            throw new Error("Gagal menambahkan sub kriteria baru.");
        }
    }

    // READ: Mendapatkan sub kriteria berdasarkan ID (untuk endpoint /api/subkriteria/:id)
    static async findById(id) {
        try {
            const sql = "SELECT id, kriteria_id, nama, nilai FROM sub_kriterias WHERE id = ?";
            const [rows] = await db.query(sql, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error("Error finding SubKriteria by ID:", error);
            throw new Error("Gagal mengambil data sub kriteria.");
        }
    }

    /**
     * UPDATE: Mengubah data sub kriteria berdasarkan ID
     */
    static async update(id, nama, nilai) {
        try {
            // Kita tidak mengizinkan kriteria_id diubah, hanya nama dan nilai
            const sql = "UPDATE sub_kriterias SET nama = ?, nilai = ? WHERE id = ?";
            const [result] = await db.query(sql, [nama, nilai, id]);

            if (result.affectedRows === 0) {
                return null; // Sub Kriteria tidak ditemukan
            }
            return { id, nama, nilai };
        } catch (error) {
            console.error("Error updating SubKriteria:", error);
            throw new Error("Gagal memperbarui sub kriteria.");
        }
    }

    /**
     * DELETE: Menghapus sub kriteria berdasarkan ID
     */
    static async delete(id) {
        try {
            const sql = "DELETE FROM sub_kriterias WHERE id = ?";
            const [result] = await db.query(sql, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting SubKriteria:", error);
            throw new Error("Gagal menghapus sub kriteria.");
        }
    }
}

module.exports = SubKriteriaModel;