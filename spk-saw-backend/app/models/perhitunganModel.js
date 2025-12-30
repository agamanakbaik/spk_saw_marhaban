// app/models/perhitunganModel.js
// Bertanggung jawab atas SEMUA logika perhitungan SAW.

const KriteriaModel = require("./KriteriaModel");
const AlternatifModel = require("./AlternatifModel");
const PenilaianModel = require("./PenilaianModel");

const PerhitunganModel = {};

// Fungsi utama perhitungan (Menerima filterId dari Controller)
PerhitunganModel.calculateSAW = async(filterId) => {

    // ===========================================
    // LANGKAH 1: Ambil Data (Sesuai Filter ID)
    // ===========================================
    // Kita kirim filterId ke model lain.
    // Jika Admin Biasa -> filterId = ID dia.
    // Jika Superadmin -> filterId = ID Admin yang dipilih.
    const kriterias = await KriteriaModel.findAll(filterId);
    const alternatifs = await AlternatifModel.getAll(filterId);
    const penilaians = await PenilaianModel.getAll(filterId);

    // Validasi data
    if (kriterias.length === 0) {
        throw new Error("Data Kriteria masih kosong. Silakan isi dulu.");
    }
    if (alternatifs.length === 0) {
        throw new Error("Data Alternatif masih kosong. Silakan isi dulu.");
    }
    if (penilaians.length === 0) {
        throw new Error("Data Penilaian masih kosong. Harap isi nilai terlebih dahulu.");
    }

    // ===========================================
    // LANGKAH 1B: Normalisasi Bobot Kriteria
    // ===========================================
    let totalBobot = 0;
    kriterias.forEach(k => {
        totalBobot += parseFloat(k.bobot);
    });

    if (totalBobot === 0) {
        throw new Error('Total bobot kriteria adalah 0. Perhitungan tidak dapat dilanjutkan.');
    }

    // ===========================================
    // LANGKAH 2: Buat Matriks Awal (X)
    // ===========================================
    const penilaianMap = new Map();
    penilaians.forEach((p) => {
        penilaianMap.set(`${p.alternatif_id}-${p.kriteria_id}`, p.nilai);
    });

    const initialValues = alternatifs.map((alt) => {
        let row = {
            alternatif_id: alt.id,
            alternatif_nama: `${alt.nama_periode} ${alt.deskripsi ? '('+alt.deskripsi+')' : ''}`,
        };
        kriterias.forEach((k) => {
            const nilai = penilaianMap.get(`${alt.id}-${k.id}`) || 0;
            row[k.kode] = parseFloat(nilai);
        });
        return row;
    });

    // ===========================================
    // LANGKAH 3: Cari Nilai Max/Min per Kriteria
    // ===========================================
    const minMax = {};
    kriterias.forEach((k) => {
        const values = initialValues.map((row) => row[k.kode]);
        if (k.tipe.toLowerCase() === "benefit") {
            minMax[k.kode] = Math.max(...values);
        } else { // Cost
            minMax[k.kode] = Math.min(...values);
        }
    });

    // ===========================================
    // LANGKAH 4: Matriks Normalisasi (R)
    // ===========================================
    const normalizedValues = initialValues.map((row) => {
        let normalizedRow = {...row };
        kriterias.forEach((k) => {
            const x_ij = row[k.kode];
            const maxMinVal = minMax[k.kode];

            if (k.tipe.toLowerCase() === "benefit") {
                normalizedRow[k.kode] = maxMinVal === 0 ? 0 : x_ij / maxMinVal;
            } else { // Cost
                normalizedRow[k.kode] = x_ij === 0 ? 0 : maxMinVal / x_ij;
            }
        });
        return normalizedRow;
    });

    // ==================================================
    // LANGKAH 5: Hitung Matriks Terbobot (W * R)
    // ==================================================
    const bobotMap = new Map();
    kriterias.forEach((k) => {
        bobotMap.set(k.kode, parseFloat(k.bobot) / totalBobot);
    });

    const weightedNormalizedValues = normalizedValues.map((row) => {
        let weightedRow = {...row };
        kriterias.forEach((k) => {
            const w_j = bobotMap.get(k.kode);
            const r_ij = row[k.kode];
            weightedRow[k.kode] = w_j * r_ij;
        });
        return weightedRow;
    });

    // ===========================================
    // LANGKAH 6: Hitung Skor Akhir (V)
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
    // LANGKAH 7: Perankingan
    // ===========================================
    finalScores.sort((a, b) => b.nilai - a.nilai); // Descending
    const ranking = finalScores.map((item, index) => ({
        ...item,
        rank: index + 1,
    }));

    // ===========================================
    // LANGKAH 8: Return Data
    // ===========================================
    const kriteriaDataForFrontend = kriterias.map(k => ({
        ...(k.dataValues || k),
        bobot_normalisasi: parseFloat(k.bobot) / totalBobot
    }));

    return {
        kriteriaData: kriteriaDataForFrontend,
        initialValues: initialValues,
        normalizedValues: normalizedValues,
        weightedNormalizedValues: weightedNormalizedValues,
        ranking: ranking,
    };
};

module.exports = PerhitunganModel;