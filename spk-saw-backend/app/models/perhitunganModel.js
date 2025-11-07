// app/models/perhitunganModel.js
// Bertanggung jawab atas SEMUA logika perhitungan SAW

// Model ini Boleh mengimpor model lain untuk mendapatkan datanya
const KriteriaModel = require("./KriteriaModel");
const AlternatifModel = require("./AlternatifModel");
const PenilaianModel = require("./PenilaianModel");

const PerhitunganModel = {};

// Satu fungsi utama untuk melakukan semua perhitungan
PerhitunganModel.calculateSAW = async () => {
    // ===========================================
    // LANGKAH 1: Ambil Semua Data dari Database
    // ===========================================
    const kriterias = await KriteriaModel.findAll();
    const alternatifs = await AlternatifModel.getAll();
    const penilaians = await PenilaianModel.getAll();

    // Validasi data (sekarang 'throw error' agar ditangkap Controller)
    if (kriterias.length === 0 || alternatifs.length === 0) {
        throw new Error("Data Kriteria atau Alternatif masih kosong."); // Akan jadi 400
    }
    if (penilaians.length === 0) {
        throw new Error("Data Penilaian masih kosong. Harap isi nilai terlebih dahulu."); // Akan jadi 400
    }

    // ===========================================
    // LANGKAH 1B: Normalisasi Bobot Kriteria
    // ===========================================
    let totalBobot = 0;
    kriterias.forEach(k => {
        totalBobot += parseFloat(k.bobot);
    });
    
    if (totalBobot === 0) {
        throw new Error('Total bobot kriteria adalah 0. Perhitungan tidak dapat dilanjutkan.'); // Akan jadi 400
    }

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
        } else { // 'cost'
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
            } else { // 'cost'
                normalizedRow[k.kode] = x_ij === 0 ? 0 : maxMinVal / x_ij;
            }
        });
        return normalizedRow;
    });

    // ==================================================
    // LANGKAH 5: Hitung Nilai Normalisasi TERBOBOT
    // ==================================================
    const bobotMap = new Map(); // Map('C1' -> bobot NORMALISASI)
    kriterias.forEach((k) => {
        bobotMap.set(k.kode, parseFloat(k.bobot) / totalBobot);
    });

    const weightedNormalizedValues = normalizedValues.map((row) => {
        let weightedRow = {...row };
        kriterias.forEach((k) => {
            const w_j_normalized = bobotMap.get(k.kode);
            const r_ij = row[k.kode];
            weightedRow[k.kode] = w_j_normalized * r_ij;
        });
        return weightedRow;
    });

    // ===========================================
    // LANGKAH 6: Hitung Nilai Preferensi (V) / Skor Akhir
    // ===========================================
    const finalScores = weightedNormalizedValues.map((row) => {
        let totalNilai = 0;
        kriterias.forEach((k) => {
            totalNilai += row[k.kode];
        });
        return {
            alternatif_id: row.alternatif_id,
            alternatif_nama: row.alternatif_nama,
            nilai: totalNilai,
        };
    });

    // ===========================================
    // LANGKAH 7: Lakukan Perankingan
    // ===========================================
    finalScores.sort((a, b) => b.nilai - a.nilai);
    const ranking = finalScores.map((item, index) => ({
        ...item,
        rank: index + 1,
    }));

    // ===========================================
    // LANGKAH 8: Siapkan data untuk dikirim
    // ===========================================
    const kriteriaDataForFrontend = kriterias.map(k => ({
        ...(k.dataValues || k),
        bobot_normalisasi: parseFloat(k.bobot) / totalBobot
    }));

    // Kembalikan SEMUA hasil perhitungan sebagai satu objek
    return {
        kriteriaData: kriteriaDataForFrontend,
        initialValues: initialValues,
        normalizedValues: normalizedValues,
        weightedNormalizedValues: weightedNormalizedValues,
        ranking: ranking,
    };
};

module.exports = PerhitunganModel;