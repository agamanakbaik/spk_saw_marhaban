/**
 * MODEL: PenilaianModel.js
 * SUDAH UPDATE: Support Strict Filter & Superadmin Editing.
 */
const db = require("../../config/db");

class PenilaianModel {

    /**
     * SIMPAN BATCH (Smart Logic)
     * - Admin Biasa: Hanya bisa edit punya sendiri.
     * - Superadmin: Bisa edit punya siapa saja (berdasarkan Alternatif ID).
     */
    static async saveAll(adminId, penilaianData, role) {
        if (!penilaianData || penilaianData.length === 0) return 0;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            let affectedCount = 0;

            for (const p of penilaianData) {
                let sqlCheck, paramsCheck;

                // --- LOGIKA CEK KEPEMILIKAN ---
                if (role === 'superadmin') {
                    // Superadmin: Cek berdasarkan kombinasi Alternatif & Kriteria saja.
                    // (Mengabaikan admin_id, supaya bisa edit data milik Admin lain)
                    sqlCheck = "SELECT id FROM penilaians WHERE alternatif_id = ? AND kriteria_id = ?";
                    paramsCheck = [p.alternatif_id, p.kriteria_id];
                } else {
                    // Admin Biasa: WAJIB cek admin_id (Hanya bisa edit punya sendiri)
                    sqlCheck = "SELECT id FROM penilaians WHERE admin_id = ? AND alternatif_id = ? AND kriteria_id = ?";
                    paramsCheck = [adminId, p.alternatif_id, p.kriteria_id];
                }

                const [exist] = await connection.query(sqlCheck, paramsCheck);

                if (exist.length > 0) {
                    // UPDATE (Jika data sudah ada)
                    // Update nilainya saja. Pemilik data (admin_id) TIDAK DIUBAH.
                    await connection.query(
                        "UPDATE penilaians SET nilai = ? WHERE id = ?", [p.nilai, exist[0].id]
                    );
                } else {
                    // INSERT (Jika data belum ada)
                    // Data baru tercatat atas nama yang sedang login
                    await connection.query(
                        "INSERT INTO penilaians (admin_id, alternatif_id, kriteria_id, nilai) VALUES (?, ?, ?, ?)", [adminId, p.alternatif_id, p.kriteria_id, p.nilai]
                    );
                }
                affectedCount++;
            }

            await connection.commit();
            return affectedCount;

        } catch (error) {
            await connection.rollback();
            console.error("Error saving penilaian batch:", error);
            throw new Error("Gagal menyimpan penilaian. " + error.message);
        } finally {
            connection.release();
        }
    }

    /**
     * AMBIL SEMUA (Strict Filtered)
     */
    static async getAll(filterId) {
        try {
            let sql = `
                SELECT 
                    p.id, p.nilai,
                    p.alternatif_id, p.kriteria_id, 
                    a.kode_alternatif, a.nama_periode,
                    k.kode AS kode_kriteria, k.nama AS nama_kriteria,
                    admins.username as penginput
                FROM penilaians p
                JOIN alternatifs a ON p.alternatif_id = a.id
                JOIN kriterias k ON p.kriteria_id = k.id
                LEFT JOIN admins ON p.admin_id = admins.id 
            `;

            let params = [];

            // Karena Controller Mode Strict, filterId pasti terisi saat sampai sini.
            if (filterId) {
                sql += " WHERE p.admin_id = ? ";
                params.push(filterId);
            }
            // Else: Jika filterId null (fallback), query akan ambil semua data global.

            sql += " ORDER BY a.kode_alternatif, k.kode";

            const [rows] = await db.query(sql, params);
            return rows;
        } catch (error) {
            console.error("Error fetching all penilaian:", error);
            throw new Error("Gagal mengambil data penilaian.");
        }
    }

    /**
     * HAPUS (Cek Role)
     */
    static async deleteById(id, adminId, role) {
        try {
            let sql = "DELETE FROM penilaians WHERE id = ?";
            let params = [id];

            // Jika BUKAN superadmin, kunci hapus hanya untuk data sendiri
            if (role !== 'superadmin') {
                sql += " AND admin_id = ?";
                params.push(adminId);
            }

            const [result] = await db.query(sql, params);
            return result.affectedRows;
        } catch (error) {
            console.error("Error deleting penilaian:", error);
            throw new Error("Gagal menghapus data penilaian.");
        }
    }
}

module.exports = PenilaianModel;