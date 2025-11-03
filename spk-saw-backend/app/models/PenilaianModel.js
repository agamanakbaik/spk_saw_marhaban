/**
 * MODEL: PenilaianModel.js
 * Menangani CRUD untuk Penilaian Alternatif (Matriks Keputusan Xij).
 */
const db = require("../../config/db"); // Pastikan path ini benar

class PenilaianModel {
    // =======================================================
    // === MODEL BARU UNTUK UI 'SIMPAN SEMUA' DARI APP.JS ===
    // =======================================================

    /**
     * Menyimpan/Memperbarui SEMUA data penilaian sekaligus (Batch).
     * Menggunakan "ON DUPLICATE KEY UPDATE" untuk efisiensi.
     * @param {Array<Object>} penilaianData - Array [{ alternatif_id, kriteria_id, nilai }]
     */
    static async saveAll(penilaianData) {
        if (!penilaianData || penilaianData.length === 0) {
            return 0;
        }

        try {
            // 1. Siapkan data 'values'
            // HANYA 3 KOLOM, karena app.js tidak mengirim 'periode'
            const values = penilaianData
                .map((p) => [p.alternatif_id, p.kriteria_id, p.nilai])
                .flat(); // Meratakan array [[1,1,5], [1,2,3]] -> [1,1,5,1,2,3]

            // 2. Buat placeholder (?) untuk 3 kolom
            const placeholders = penilaianData.map(() => "(?, ?, ?)").join(", ");

            // 3. Buat query SQL
            // PERHATIKAN: Query ini mengasumsikan 3 kolom.
            // Ini membutuhkan UNIQUE KEY di DB pada (alternatif_id, kriteria_id)
            const sql = `
                INSERT INTO penilaians (alternatif_id, kriteria_id, nilai)
                VALUES ${placeholders}
                ON DUPLICATE KEY UPDATE
                    nilai = VALUES(nilai)
            `;

            // 4. Eksekusi query
            const [result] = await db.query(sql, values);

            return result.affectedRows; // Mengembalikan jumlah baris yang diubah/dimasukkan
        } catch (error) {
            console.error("Error saving all penilaian:", error);
            // Tangani error umum
            if (error.code === "ER_NO_REFERENCED_ROW_2") {
                throw new Error(
                    "Gagal: Salah satu ID Alternatif atau Kriteria tidak ada di database."
                );
            }
            if (
                error.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD" ||
                error.code === "ER_BAD_NULL_ERROR"
            ) {
                throw new Error(
                    "Gagal: Kolom 'periode' di database Anda mungkin wajib diisi (NOT NULL)."
                );
            }
            throw new Error(
                "Gagal menyimpan data ke database. Pastikan Anda sudah menambah 'UNIQUE KEY' (alternatif_id, kriteria_id)."
            );
        }
    }

    // =======================================================
    // === MODEL LAMA ANDA (TETAP DISIMPAN) ===
    // =======================================================

    /**
     * Menyimpan semua penilaian untuk satu alternatif dalam satu periode. (Batch Lama)
     */
    static async createBatch(periode, alternatifId, penilaianData) {
        if (penilaianData.length === 0) {
            return;
        }

        try {
            // Persiapan VALUES untuk query INSERT (4 kolom)
            const values = penilaianData
                .map((p) => [alternatifId, p.kriteria_id, periode, p.nilai])
                .flat();

            const placeholders = penilaianData.map(() => "(?, ?, ?, ?)").join(", ");

            const sql = `
                INSERT INTO penilaians (alternatif_id, kriteria_id, periode, nilai)
                VALUES ${placeholders}
                ON DUPLICATE KEY UPDATE
                    nilai = VALUES(nilai)
            `;

            await db.query(sql, values);
            return { periode, alternatifId, count: penilaianData.length };
        } catch (error) {
            console.error("Error creating batch penilaian:", error);
            if (error.code === "ER_NO_REFERENCED_ROW_2") {
                throw new Error("Alternatif atau Kriteria ID tidak valid.");
            }
            throw new Error("Gagal menyimpan penilaian alternatif.");
        }
    }

    /**
     * Mendapatkan semua data penilaian (Xij) untuk periode tertentu.
     */
    static async getPenilaianByPeriode(periode) {
        try {
            const [rows] = await db.query(
                `
                SELECT 
                    p.id, p.periode, p.nilai,
                    p.alternatif_id, p.kriteria_id,
                    a.kode_alternatif, a.nama_periode,
                    k.kode AS kode_kriteria, k.nama AS nama_kriteria
                FROM penilaians p
                JOIN alternatifs a ON p.alternatif_id = a.id
                JOIN kriterias k ON p.kriteria_id = k.id
                WHERE p.periode = ?
                ORDER BY a.kode_alternatif, k.kode
            `, [periode]
            );
            return rows;
        } catch (error) {
            console.error("Error fetching penilaian by periode:", error);
            throw new Error("Gagal mengambil data penilaian.");
        }
    }

    /**
     * Mendapatkan SEMUA data penilaian dari semua periode.
     * (Ini yang dipakai app.js untuk mengisi tabel)
     */
    static async getAll() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    p.id, p.periode, p.nilai,
                    p.alternatif_id, p.kriteria_id, 
                    a.kode_alternatif, a.nama_periode,
                    k.kode AS kode_kriteria, k.nama AS nama_kriteria
                FROM penilaians p
                JOIN alternatifs a ON p.alternatif_id = a.id
                JOIN kriterias k ON p.kriteria_id = k.id
                ORDER BY p.periode, a.kode_alternatif, k.kode
            `);
            return rows;
        } catch (error) {
            console.error("Error fetching all penilaian:", error);
            throw new Error("Gagal mengambil semua data penilaian.");
        }
    }

    /**
     * Menghapus satu data penilaian berdasarkan ID uniknya.
     */
    static async deleteById(id) {
        try {
            const [result] = await db.query("DELETE FROM penilaians WHERE id = ?", [
                id,
            ]);
            return result.affectedRows;
        } catch (error) {
            console.error("Error deleting penilaian:", error);
            throw new Error("Gagal menghapus data penilaian.");
        }
    }
}

module.exports = PenilaianModel;