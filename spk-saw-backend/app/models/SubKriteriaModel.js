/**
 * MODEL: SubKriteriaModel.js
 * Menangani operasi CRUD untuk tabel sub_kriterias.
 * UPDATED: Support Superadmin Editing & Viewing.
 */
const db = require('../../config/db');

class SubKriteriaModel {

    // READ: Mendapatkan SEMUA sub kriteria (Filtered)
    static async findAll(filterId) {
        try {
            // Karena Controller strict, filterId pasti ada
            const sql = "SELECT id, kriteria_id, nama, nilai, keterangan FROM sub_kriterias WHERE admin_id = ? ORDER BY kriteria_id ASC, nilai DESC";
            const [rows] = await db.query(sql, [filterId]);
            return rows;
        } catch (error) {
            console.error("Error finding all SubKriterias:", error);
            throw new Error("Gagal mengambil semua daftar sub kriteria.");
        }
    }

    // READ: Mendapatkan sub kriteria berdasarkan ID Kriteria & Target Admin
    static async findByKriteriaId(kriteriaId, targetAdminId) {
        try {
            // Filter berdasarkan kriteria_id DAN admin_id yang ditargetkan
            const sql = "SELECT id, kriteria_id, nama, nilai, keterangan FROM sub_kriterias WHERE kriteria_id = ? AND admin_id = ? ORDER BY nilai DESC";
            const [rows] = await db.query(sql, [kriteriaId, targetAdminId]);
            return rows;
        } catch (error) {
            console.error("Error finding SubKriterias by Kriteria ID:", error);
            throw new Error("Gagal mengambil daftar sub kriteria.");
        }
    }

    // CREATE: Menambah sub kriteria baru
    static async create(adminId, kriteria_id, nama, nilai, keterangan) {
        try {
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

    // READ: Detail by ID (Cek Role)
    static async findById(id, userId, role) {
        try {
            let sql = "SELECT id, kriteria_id, nama, nilai, keterangan FROM sub_kriterias WHERE id = ?";
            let params = [id];

            // Jika BUKAN Superadmin, kunci hanya lihat punya sendiri
            if (role !== 'superadmin') {
                sql += " AND admin_id = ?";
                params.push(userId);
            }

            const [rows] = await db.query(sql, params);
            return rows[0] || null;
        } catch (error) {
            console.error("Error finding SubKriteria by ID:", error);
            throw new Error("Gagal mengambil data sub kriteria.");
        }
    }

    // UPDATE: Edit (Cek Role)
    static async update(id, userId, nama, nilai, keterangan, role) {
        try {
            let sql = "UPDATE sub_kriterias SET nama = ?, nilai = ?, keterangan = ? WHERE id = ?";
            let params = [nama, nilai, keterangan, id];

            // Jika BUKAN Superadmin, kunci edit hanya punya sendiri
            if (role !== 'superadmin') {
                sql += " AND admin_id = ?";
                params.push(userId);
            }

            const [result] = await db.query(sql, params);

            if (result.affectedRows === 0) {
                return null;
            }
            return { id, nama, nilai, keterangan };
        } catch (error) {
            console.error("Error updating SubKriteria:", error);
            throw new Error("Gagal memperbarui sub kriteria.");
        }
    }

    // DELETE: Hapus (Cek Role)
    static async delete(id, userId, role) {
        try {
            let sql = "DELETE FROM sub_kriterias WHERE id = ?";
            let params = [id];

            // Jika BUKAN Superadmin, kunci hapus hanya punya sendiri
            if (role !== 'superadmin') {
                sql += " AND admin_id = ?";
                params.push(userId);
            }

            const [result] = await db.query(sql, params);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting SubKriteria:", error);
            throw new Error("Gagal menghapus sub kriteria.");
        }
    }
}

module.exports = SubKriteriaModel;