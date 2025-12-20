/**
 * MODEL: SubKriteriaModel.js
 * Menangani operasi CRUD untuk tabel sub_kriterias dengan FILTER ADMIN_ID.
 */
const db = require('../../config/db');

class SubKriteriaModel {

    // READ: Mendapatkan SEMUA sub kriteria MILIK USER LOGIN
    static async findAll(adminId) {
        try {
            const sql = "SELECT id, kriteria_id, nama, nilai, keterangan FROM sub_kriterias WHERE admin_id = ? ORDER BY kriteria_id ASC, nilai DESC";
            const [rows] = await db.query(sql, [adminId]);
            return rows;
        } catch (error) {
            console.error("Error finding all SubKriterias:", error);
            throw new Error("Gagal mengambil semua daftar sub kriteria.");
        }
    }

    // READ: Mendapatkan sub kriteria berdasarkan ID Kriteria & User
    static async findByKriteriaId(kriteriaId, adminId) {
        try {
            // Tambahkan AND admin_id = ?
            const sql = "SELECT id, kriteria_id, nama, nilai, keterangan FROM sub_kriterias WHERE kriteria_id = ? AND admin_id = ? ORDER BY nilai DESC";
            const [rows] = await db.query(sql, [kriteriaId, adminId]);
            return rows;
        } catch (error) {
            console.error("Error finding SubKriterias by Kriteria ID:", error);
            throw new Error("Gagal mengambil daftar sub kriteria.");
        }
    }

    // CREATE: Menambah sub kriteria baru dengan admin_id
    static async create(adminId, kriteria_id, nama, nilai, keterangan) {
        try {
            // Masukkan admin_id ke database
            const sql = "INSERT INTO sub_kriterias (admin_id, kriteria_id, nama, nilai, keterangan) VALUES (?, ?, ?, ?, ?)";
            const [result] = await db.query(sql, [adminId, kriteria_id, nama, nilai, keterangan]);
            return { id: result.insertId, adminId, kriteria_id, nama, nilai, keterangan };
        } catch (error) {
            console.error("Error creating SubKriteria:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error("Sub Kriteria sudah ada.");
            }
            throw new Error("Gagal menambahkan sub kriteria baru.");
        }
    }

    // READ: Mendapatkan sub kriteria berdasarkan ID & User
    static async findById(id, adminId) {
        try {
            const sql = "SELECT id, kriteria_id, nama, nilai, keterangan FROM sub_kriterias WHERE id = ? AND admin_id = ?";
            const [rows] = await db.query(sql, [id, adminId]);
            return rows[0] || null;
        } catch (error) {
            console.error("Error finding SubKriteria by ID:", error);
            throw new Error("Gagal mengambil data sub kriteria.");
        }
    }

    // UPDATE: Mengubah data sub kriteria MILIK USER LOGIN
    static async update(id, adminId, nama, nilai, keterangan) {
        try {
            // Tambahkan AND admin_id = ?
            const sql = "UPDATE sub_kriterias SET nama = ?, nilai = ?, keterangan = ? WHERE id = ? AND admin_id = ?";
            const [result] = await db.query(sql, [nama, nilai, keterangan, id, adminId]);

            if (result.affectedRows === 0) {
                return null;
            }
            return { id, nama, nilai, keterangan };
        } catch (error) {
            console.error("Error updating SubKriteria:", error);
            throw new Error("Gagal memperbarui sub kriteria.");
        }
    }

    // DELETE: Menghapus sub kriteria MILIK USER LOGIN
    static async delete(id, adminId) {
        try {
            // Tambahkan AND admin_id = ?
            const sql = "DELETE FROM sub_kriterias WHERE id = ? AND admin_id = ?";
            const [result] = await db.query(sql, [id, adminId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting SubKriteria:", error);
            throw new Error("Gagal menghapus sub kriteria.");
        }
    }
}

module.exports = SubKriteriaModel;