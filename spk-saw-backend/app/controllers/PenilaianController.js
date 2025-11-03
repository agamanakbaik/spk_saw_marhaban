/**
 * CONTROLLER: PenilaianController.js
 * Menangani logika HTTP untuk Penilaian Alternatif.
 */
const PenilaianModel = require("../models/PenilaianModel");

// =======================================================
// === KONTROLER BARU UNTUK UI 'SIMPAN SEMUA' DARI APP.JS ===
// =======================================================

/**
 * [CREATE/UPDATE BATCH] Menerima semua data dari form 'Nilai Alternatif'
 * Dipanggil oleh: POST /api/penilaian/save-all
 */
exports.saveAllPenilaian = async(req, res) => {
    // req.body akan berisi array: [{ alternatif_id, kriteria_id, nilai }, ...]
    const penilaianData = req.body;

    if (!Array.isArray(penilaianData) || penilaianData.length === 0) {
        return res
            .status(400)
            .json({ message: "Data penilaian tidak valid atau kosong." });
    }

    try {
        // Panggil model untuk menyimpan semua data
        const affectedRows = await PenilaianModel.saveAll(penilaianData);

        res.status(201).json({
            message: `Berhasil menyimpan/memperbarui ${affectedRows} data penilaian.`,
            data: { count: affectedRows },
        });
    } catch (error) {
        console.error("Error in saveAllPenilaian:", error);
        res.status(500).json({ message: error.message });
    }
};

// =======================================================
// === KONTROLER LAMA ANDA (TETAP DISIMPAN) ===
// =======================================================

// [READ] Mendapatkan semua penilaian (atau by periode jika ada query)
exports.getAllPenilaians = async(req, res) => {
    try {
        // Cek apakah ada query parameter 'periode' di URL
        if (req.query.periode) {
            const periode = req.query.periode;
            const data = await PenilaianModel.getPenilaianByPeriode(periode);
            res.status(200).json({
                message: `Data penilaian untuk periode ${periode} berhasil diambil.`,
                data: data,
            });
        } else {
            // Jika tidak ada query 'periode', panggil fungsi untuk mengambil semua data
            // Ini yang dipakai oleh app.js
            const data = await PenilaianModel.getAll();
            res.status(200).json({
                message: "Semua data penilaian berhasil diambil.",
                data: data,
            });
        }
    } catch (error) {
        console.error("Error in getAllPenilaians:", error);
        res.status(500).json({ message: error.message });
    }
};

// [CREATE/UPDATE BATCH LAMA] Menambah/Memperbarui Penilaian Alternatif (Batch)
exports.createOrUpdatePenilaian = async(req, res) => {
    const { periode, alternatif_id, penilaian } = req.body;

    // Validasi input wajib
    if (!periode || !alternatif_id || !penilaian || penilaian.length === 0) {
        return res.status(400).json({
            message: "Periode, ID Alternatif, dan data penilaian (kriteria) wajib diisi.",
        });
    }

    try {
        // Panggil model untuk menyimpan/memperbarui batch data
        const result = await PenilaianModel.createBatch(
            periode,
            alternatif_id,
            penilaian
        );

        res.status(201).json({
            message: "Penilaian berhasil disimpan/diperbarui.",
            data: result,
        });
    } catch (error) {
        console.error("Error in createOrUpdatePenilaian:", error);
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] Menghapus satu data penilaian berdasarkan ID
exports.deletePenilaian = async(req, res) => {
    const { id } = req.params; // Mengambil ID dari URL (misal: /api/penilaian/15)

    try {
        const affectedRows = await PenilaianModel.deleteById(id);

        if (affectedRows === 0) {
            // Jika tidak ada baris yang terhapus, berarti ID tidak ditemukan
            return res
                .status(404)
                .json({ message: "Data penilaian tidak ditemukan." });
        }

        res.status(200).json({
            message: "Data penilaian berhasil dihapus.",
        });
    } catch (error) {
        console.error("Error in deletePenilaian:", error);
        res.status(500).json({ message: error.message });
    }
};

// [UPDATE] Memperbarui satu data penilaian berdasarkan ID (Fungsi lama Anda)
exports.updatePenilaianById = async(req, res) => {
    const { id } = req.params; // Ambil ID dari URL
    const { nilai } = req.body; // Ambil data baru dari body request

    // Validasi input
    if (nilai === undefined) {
        return res.status(400).json({ message: "Nilai wajib diisi." });
    }

    try {
        // Panggil fungsi model untuk update (Anda perlu membuatnya juga di PenilaianModel.js)
        // const affectedRows = await PenilaianModel.updateById(id, nilai);

        // if (affectedRows === 0) {
        //     return res.status(404).json({ message: "Data penilaian tidak ditemukan." });
        // }

        res
            .status(200)
            .json({ message: `Data penilaian dengan ID ${id} berhasil diperbarui.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};