/**
 * MODEL: SubKriteriaModel.js
 * Menangani operasi CRUD untuk tabel sub_kriterias.
 */
const db = require('../../config/db');

class SubKriteriaModel {

    // 🆕 READ: Mendapatkan SEMUA sub kriteria
    static async findAll() {
        try {
            // PERUBAHAN: Menambahkan 'keterangan'
            const sql = "SELECT id, kriteria_id, nama, nilai, keterangan FROM sub_kriterias ORDER BY kriteria_id ASC, nilai DESC";
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            console.error("Error finding all SubKriterias:", error);
            throw new Error("Gagal mengambil semua daftar sub kriteria.");
        }
    }

    // 🆕 READ: Mendapatkan sub kriteria berdasarkan ID Kriteria
    static async findByKriteriaId(kriteriaId) {
        try {
            // PERUBAHAN: Menambahkan 'keterangan'
            const sql = "SELECT id, kriteria_id, nama, nilai, keterangan FROM sub_kriterias WHERE kriteria_id = ? ORDER BY nilai DESC";
            const [rows] = await db.query(sql, [kriteriaId]);
            return rows;
        } catch (error) {
            console.error("Error finding SubKriterias by Kriteria ID:", error);
            throw new Error("Gagal mengambil daftar sub kriteria dari DB.");
        }
    }

    // CREATE: Menambah sub kriteria baru
    // PERUBAHAN: Menambahkan parameter 'keterangan'
    static async create(kriteria_id, nama, nilai, keterangan) {
        try {
            // PERUBAHAN: Menambahkan kolom dan value 'keterangan'
            const sql = "INSERT INTO sub_kriterias (kriteria_id, nama, nilai, keterangan) VALUES (?, ?, ?, ?)";
            const [result] = await db.query(sql, [kriteria_id, nama, nilai, keterangan]);
            return { id: result.insertId, kriteria_id, nama, nilai, keterangan };
        } catch (error) {
            console.error("Error creating SubKriteria:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error("Sub Kriteria atau Nilai pada kriteria ini sudah ada.");
            }
            throw new Error("Gagal menambahkan sub kriteria baru.");
        }
    }

    // READ: Mendapatkan sub kriteria berdasarkan ID
    static async findById(id) {
        try {
            // PERUBAHAN: Menambahkan 'keterangan'
            const sql = "SELECT id, kriteria_id, nama, nilai, keterangan FROM sub_kriterias WHERE id = ?";
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
    // PERUBAHAN: Menambahkan parameter 'keterangan'
    static async update(id, nama, nilai, keterangan) {
        try {
            // PERUBAHAN: Menambahkan 'keterangan' ke query SET
            const sql = "UPDATE sub_kriterias SET nama = ?, nilai = ?, keterangan = ? WHERE id = ?";
            const [result] = await db.query(sql, [nama, nilai, keterangan, id]);

            if (result.affectedRows === 0) {
                return null; // Sub Kriteria tidak ditemukan
            }
            return { id, nama, nilai, keterangan };
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