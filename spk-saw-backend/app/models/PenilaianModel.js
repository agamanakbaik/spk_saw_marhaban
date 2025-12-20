/**
 * MODEL: PenilaianModel.js
 * Menangani CRUD Penilaian dengan FILTER ADMIN_ID.
 */
const db = require("../../config/db");

class PenilaianModel {

    /**
     * Simpan BATCH penilaian dengan ADMIN_ID
     */
    static async saveAll(adminId, penilaianData) {
        if (!penilaianData || penilaianData.length === 0) return 0;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            let affectedCount = 0;

            // Kita loop satu per satu untuk memastikan logika admin_id benar
            // Menggunakan "INSERT ... ON DUPLICATE KEY UPDATE"
            for (const p of penilaianData) {
                // Pastikan alternatif dan kriteria yang dinilai juga milik admin ini (Validasi)
                // (Opsional, tapi bagus untuk keamanan). Di sini kita langsung insert saja.

                // Query: Insert jika belum ada, Update jika sudah ada (kunci unik: admin_id + alt_id + krit_id)
                // Pastikan Anda punya UNIQUE INDEX di DB: (admin_id, alternatif_id, kriteria_id)
                // Jika belum ada unique index, query ini mungkin insert duplikat.

                // Cara Aman Tanpa Unique Index: Cek dulu exist
                const [exist] = await connection.query(
                    "SELECT id FROM penilaians WHERE admin_id = ? AND alternatif_id = ? AND kriteria_id = ?", [adminId, p.alternatif_id, p.kriteria_id]
                );

                if (exist.length > 0) {
                    // Update
                    await connection.query(
                        "UPDATE penilaians SET nilai = ? WHERE id = ?", [p.nilai, exist[0].id]
                    );
                } else {
                    // Insert
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
     * Ambil SEMUA penilaian milik ADMIN tertentu
     */
    static async getAll(adminId) {
        try {
            // Filter WHERE admin_id = ?
            const sql = `
                SELECT 
                    p.id, p.nilai,
                    p.alternatif_id, p.kriteria_id, 
                    a.kode_alternatif, a.nama_periode,
                    k.kode AS kode_kriteria, k.nama AS nama_kriteria
                FROM penilaians p
                JOIN alternatifs a ON p.alternatif_id = a.id
                JOIN kriterias k ON p.kriteria_id = k.id
                WHERE p.admin_id = ?
                ORDER BY a.kode_alternatif, k.kode
            `;
            const [rows] = await db.query(sql, [adminId]);
            return rows;
        } catch (error) {
            console.error("Error fetching all penilaian:", error);
            throw new Error("Gagal mengambil data penilaian.");
        }
    }

    /**
     * Hapus penilaian milik ADMIN tertentu
     */
    static async deleteById(id, adminId) {
        try {
            const [result] = await db.query(
                "DELETE FROM penilaians WHERE id = ? AND admin_id = ?", [id, adminId]
            );
            return result.affectedRows;
        } catch (error) {
            console.error("Error deleting penilaian:", error);
            throw new Error("Gagal menghapus data penilaian.");
        }
    }
}

module.exports = PenilaianModel;