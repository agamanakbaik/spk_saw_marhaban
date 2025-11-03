/**
 * CONTROLLER: PerhitunganController.js
 * Menangani logika untuk menjalankan perhitungan SAW.
 */

// Impor model database Anda
const KriteriaModel = require("../models/KriteriaModel");
const AlternatifModel = require("../models/AlternatifModel");
const PenilaianModel = require("../models/PenilaianModel");

/**
 * [POST] /api/perhitungan/hitung
 * Menjalankan seluruh proses perhitungan SAW.
 */
exports.hitungSaw = async (req, res) => {
    try {
        // ===========================================
        // LANGKAH 1: Ambil Semua Data dari Database
        // ===========================================
        const kriterias = await KriteriaModel.findAll(); // Menggunakan findAll() sesuai error sebelumnya
        const alternatifs = await AlternatifModel.getAll();
        const penilaians = await PenilaianModel.getAll();

        if (kriterias.length === 0 || alternatifs.length === 0) {
            return res
                .status(400)
                .json({ message: "Data Kriteria atau Alternatif masih kosong." });
        }
        if (penilaians.length === 0) {
            return res
                .status(400)
                .json({
                    message: "Data Penilaian masih kosong. Harap isi nilai terlebih dahulu.",
                });
        }

        // ▼▼▼ PERBAIKAN DIMULAI DI SINI ▼▼▼
        // ===========================================
        // LANGKAH 1B: Normalisasi Bobot Kriteria
        // ===========================================
        let totalBobot = 0;
        kriterias.forEach(k => {
            totalBobot += parseFloat(k.bobot);
        });
        
        // Pastikan totalBobot tidak 0 untuk menghindari pembagian dengan nol
        if (totalBobot === 0) {
             return res.status(400).json({ message: 'Total bobot kriteria adalah 0. Perhitungan tidak dapat dilanjutkan.' });
        }
        // ▲▲▲ AKHIR PERBAIKAN 1B ▲▲▲


        // Buat map kriteria untuk akses mudah (id -> kriteria object)
        const kriteriaMapById = new Map();
        kriterias.forEach((k) => kriteriaMapById.set(k.id, k));

        // ===========================================
        // LANGKAH 2: Buat Matriks Awal (X) / Nilai Awal
        // ===========================================
        const penilaianMap = new Map(); // Map('alt_id-krit_id' -> nilai)
        penilaians.forEach((p) => {
            penilaianMap.set(`${p.alternatif_id}-${p.kriteria_id}`, p.nilai);
        });

        const initialValues = alternatifs.map((alt) => {
            let row = {
                alternatif_id: alt.id,
                alternatif_nama: `${alt.nama_periode} (${alt.deskripsi || ""})`,
            };
            kriterias.forEach((k) => {
                const nilai = penilaianMap.get(`${alt.id}-${k.id}`) || 0;
                row[k.kode] = parseFloat(nilai); // Gunakan kode kriteria (C1, C2) sebagai key
            });
            return row;
        });

        // ===========================================
        // LANGKAH 3: Cari Nilai Max/Min per Kriteria
        // ===========================================
        const minMax = {}; // Map('C1' -> max/min value)
        kriterias.forEach((k) => {
            const values = initialValues.map((row) => row[k.kode]);
            if (k.tipe.toLowerCase() === "benefit") {
                minMax[k.kode] = Math.max(...values);
            } else {
                // 'cost'
                minMax[k.kode] = Math.min(...values);
            }
        });

        // ===========================================
        // LANGKAH 4: Buat Matriks Normalisasi (R) / Nilai Normalisasi
        // ===========================================
        const normalizedValues = initialValues.map((row) => {
            let normalizedRow = {...row };
            kriterias.forEach((k) => {
                const x_ij = row[k.kode];
                const maxMinVal = minMax[k.kode];
                if (k.tipe.toLowerCase() === "benefit") {
                    normalizedRow[k.kode] = maxMinVal === 0 ? 0 : x_ij / maxMinVal;
                } else {
                    // 'cost'
                    normalizedRow[k.kode] = x_ij === 0 ? 0 : maxMinVal / x_ij;
                }
            });
            return normalizedRow;
        });

        // ==================================================
        // LANGKAH 5: Hitung Nilai Normalisasi TERBOBOT
        // ==================================================
        
        // ▼▼▼ PERBAIKAN DI SINI ▼▼▼
        const bobotMap = new Map(); // Map('C1' -> bobot NORMALISASI)
        kriterias.forEach((k) => {
            // Simpan bobot yang sudah dinormalisasi (bobot / total_bobot)
            bobotMap.set(k.kode, parseFloat(k.bobot) / totalBobot);
        });
        // ▲▲▲ AKHIR PERBAIKAN ▲▲▲

        const weightedNormalizedValues = normalizedValues.map((row) => {
            let weightedRow = {...row };
            kriterias.forEach((k) => {
                const w_j_normalized = bobotMap.get(k.kode); // Ini sudah 0.x
                const r_ij = row[k.kode];
                weightedRow[k.kode] = w_j_normalized * r_ij; // Hitung nilai terbobot
            });
            return weightedRow;
        });

        // ===========================================
        // LANGKAH 6: Hitung Nilai Preferensi (V) / Skor Akhir
        // ===========================================
        const finalScores = weightedNormalizedValues.map((row) => {
            // Gunakan data terbobot
            let totalNilai = 0;
            kriterias.forEach((k) => {
                totalNilai += row[k.kode]; // Jumlahkan semua nilai terbobot
            });
            return {
                alternatif_id: row.alternatif_id,
                alternatif_nama: row.alternatif_nama,
                nilai: totalNilai, // Ini adalah Skor Akhir (V)
            };
        });

        // ===========================================
        // LANGKAH 7: Lakukan Perankingan
        // ===========================================
        finalScores.sort((a, b) => b.nilai - a.nilai); // Urutkan
        const ranking = finalScores.map((item, index) => ({
            ...item,
            rank: index + 1,
        }));

        // ===========================================
        // LANGKAH 8: Kirim Semua Hasil ke Frontend
        // ===========================================
        
        // ▼▼▼ PERBAIKAN DI SINI: Kirim bobot yang sudah dinormalisasi ▼▼▼
        const kriteriaDataForFrontend = kriterias.map(k => ({
            ...(k.dataValues || k), // Salin semua data kriteria (handle sequelize/non-sequelize)
            bobot_normalisasi: parseFloat(k.bobot) / totalBobot // Tambahkan bobot yg sudah dinormalisasi
        }));
        // ▲▲▲ AKHIR PERBAIKAN ▲▲▲

        res.status(200).json({
            message: "Perhitungan SAW berhasil",
            kriteriaData: kriteriaDataForFrontend, // <-- Gunakan data baru
            initialValues: initialValues,
            normalizedValues: normalizedValues,
            weightedNormalizedValues: weightedNormalizedValues,
            ranking: ranking,
        });
    } catch (err) {
        console.error("Error saat menghitung SAW:", err);
        res
            .status(500)
            .json({
                message: "Terjadi kesalahan di server saat perhitungan",
                error: err.message,
            });
    }
};