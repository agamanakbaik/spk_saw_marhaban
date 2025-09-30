/**
 * SPK SAW Frontend JavaScript - Evaluasi Kesehatan Keuangan Marhaban Parfume
 * File ini mengelola interaksi UI (Sidebar, Dropdown, dan pergantian konten halaman utama)
 * menggunakan kriteria dan alternatif berbasis Rasio Keuangan.
 * Semua data yang ditampilkan di sini adalah data DUMMY sampai backend Node.js terhubung.
 */

// ===============================================
// 1. FUNGSI UTAMA UNTUK MENGGANTI KONTEN
// ===============================================

window.loadContent = (page) => {
    const contentContainer = document.getElementById('content-container');
    let htmlContent = '';
    let pageTitle = '';

    // Logika untuk menentukan konten dan judul halaman
    switch (page) {
        case 'dashboard':
            pageTitle = 'Dashboard Utama Evaluasi Keuangan';
            htmlContent = getDashboardUI();
            break;
        case 'manajemen-admin':
            pageTitle = 'Manajemen Pengguna Admin';
            htmlContent = getManajemenAdminUI();
            break;
        case 'alternatif':
            pageTitle = 'Periode Evaluasi (Alternatif)';
            htmlContent = getAlternatifUI();
            break;
        case 'kriteria':
            pageTitle = 'Kriteria (Rasio Keuangan) & Bobot';
            htmlContent = getKriteriaUI();
            break;
        case 'penilaian':
            pageTitle = 'Input Data Rasio Keuangan (Xij)';
            htmlContent = getPenilaianUI();
            break;
        case 'perhitungan':
            pageTitle = 'Proses Perhitungan SAW Kesehatan Keuangan';
            htmlContent = getPerhitunganUI();
            break;
        case 'hasil':
            pageTitle = 'Hasil Keputusan & Kategori Kesehatan Keuangan';
            htmlContent = getHasilUI();
            break;
        default:
            pageTitle = 'Halaman Tidak Ditemukan';
            htmlContent = '<p class="text-xl text-red-500">Error 404: Halaman yang diminta tidak ada.</p>';
    }

    // Memasukkan Judul Halaman dan Konten Halaman ke dalam DOM
    contentContainer.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">${pageTitle}</h1>
        ${htmlContent}
    `;

    // Menutup sidebar di tampilan mobile
    if (window.innerWidth < 768) {
        const wrapper = document.getElementById('wrapper');
        if (wrapper && wrapper.classList.contains('toggled')) {
            wrapper.classList.remove('toggled');
        }
    }
};

// ===============================================
// 2. LOGIKA UTAMA SAAT DOKUMEN DIMUAT
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('wrapper');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const userMenuButton = document.getElementById('userMenuButton');
    const userMenuDropdown = document.getElementById('userMenuDropdown');

    // --- Logika Toggle Sidebar ---
    if (sidebarToggle && wrapper) {
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            wrapper.classList.toggle('toggled');
        });

        if (window.innerWidth < 768) {
            wrapper.classList.add('toggled');
        }
    }

    // --- Logika Dropdown Menu Pengguna ---
    if (userMenuButton && userMenuDropdown) {
        userMenuButton.addEventListener('click', (e) => {
            e.preventDefault();
            userMenuDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!userMenuButton.contains(e.target) && !userMenuDropdown.contains(e.target)) {
                userMenuDropdown.classList.add('hidden');
            }
        });
    }

    // --- Memuat Halaman Awal ---
    window.loadContent('dashboard');
});

// ===============================================
// 3. FUNGSI GENERATOR KONTEN KEUANGAN (DUMMY)
// ===============================================

// Fungsi untuk Dashboard
function getDashboardUI() {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
                <h2 class="text-lg font-semibold text-gray-500 mb-2">Periode Evaluasi</h2>
                <p class="text-4xl font-bold text-gray-900">4</p>
                <p class="text-sm text-gray-400 mt-1">Periode (Tahun/Kuarta) yang dinilai</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
                <h2 class="text-lg font-semibold text-gray-500 mb-2">Total Rasio (Kriteria)</h2>
                <p class="text-4xl font-bold text-gray-900">5</p>
                <p class="text-sm text-gray-400 mt-1">Faktor Rasio Keuangan Penentu</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
                <h2 class="text-lg font-semibold text-gray-500 mb-2">Status Terkini</h2>
                <p class="text-4xl font-bold text-green-600">Sehat</p>
                <p class="text-sm text-gray-400 mt-1">Status Keuangan Q2 2024</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
                <h2 class="text-lg font-semibold text-gray-500 mb-2">Bobot Kriteria</h2>
                <p class="text-4xl font-bold text-gray-900">1.00</p>
                <p class="text-sm text-gray-400 mt-1">Total Bobot Kriteria (W)</p>
            </div>
        </div>
        
        <div class="mt-8 bg-white p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Sistem Pendukung Keputusan (SPK) Kesehatan Keuangan</h2>
            <p class="text-gray-600">Panel ini membantu Anda menganalisis kesehatan keuangan Marhaban Parfume berdasarkan rasio keuangan yang ditentukan menggunakan metode Simple Additive Weighting (SAW).</p>
            <ul class="list-disc list-inside mt-4 text-sm text-gray-500">
                <li><strong class="text-gray-700">Tujuan:</strong> Mengkategorikan kesehatan keuangan (Sehat, Cukup Sehat, Tidak Sehat).</li>
                <li><strong class="text-gray-700">Alternatif:</strong> Setiap periode keuangan (Kuarta/Tahun).</li>
            </ul>
        </div>
    `;
}

// Fungsi untuk Alternatif (Periode Evaluasi)
function getAlternatifUI() {
    return `
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <div class="flex justify-between items-center mb-4">
                <p class="text-gray-600">Daftar periode waktu atau unit bisnis (Alternatif) yang akan dievaluasi.</p>
                <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-150">
                    + Tambah Periode Evaluasi
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Periode/Unit</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">P001</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Kuarta 1, 2024</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Periode Waktu</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                <button class="text-red-600 hover:text-red-900">Hapus</button>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">P002</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Kuarta 2, 2024</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Periode Waktu</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                <button class="text-red-600 hover:text-red-900">Hapus</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Fungsi untuk Kriteria (Rasio Keuangan)
function getKriteriaUI() {
    return `
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <div class="flex justify-between items-center mb-4">
                <p class="text-gray-600">Daftar Rasio Keuangan (Kriteria) dan Bobot Kepentingannya. Total Bobot harus 1.00.</p>
                <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-150">
                    + Tambah Rasio (Kriteria)
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rasio Keuangan</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bobot (W)</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">C1</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Current Ratio (Likuiditas)</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-green-500 font-semibold">Benefit</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">0.35</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                <button class="text-red-600 hover:text-red-900">Hapus</button>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">C2</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Debt to Equity Ratio (Solvabilitas)</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-semibold">Cost</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">0.25</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                <button class="text-red-600 hover:text-red-900">Hapus</button>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">C3</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Return on Equity (Profitabilitas)</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-green-500 font-semibold">Benefit</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">0.40</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                <button class="text-red-600 hover:text-red-900">Hapus</button>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="px-6 py-4 text-right text-base font-bold text-gray-800">Total Bobot:</td>
                            <td class="px-6 py-4 text-left text-base font-bold text-indigo-600">1.00</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
}

// Fungsi untuk Input Penilaian (Nilai Rasio)
function getPenilaianUI() {
    return `
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <div class="flex justify-between items-center mb-4">
                <p class="text-gray-600">Input nilai $X_{ij}$ (hasil perhitungan Rasio Keuangan) untuk setiap periode.</p>
            </div>
            
            <div class="mb-6 flex space-x-4 items-center p-4 bg-gray-50 rounded-lg border">
                <label for="periode" class="font-semibold text-gray-700">Periode yang Dinilai:</label>
                <select id="periode" class="border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-48">
                    <option value="P002">P002 - Kuarta 2, 2024</option>
                    <option value="P001">P001 - Kuarta 1, 2024</option>
                </select>
                <button class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150">
                    Simpan Nilai Rasio
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 border">
                    <thead class="bg-indigo-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider sticky left-0 bg-indigo-50">Rasio Keuangan</th>
                            <th class="px-4 py-3 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider">Kuarta 1, 2024 (P001)</th>
                            <th class="px-4 py-3 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider">Kuarta 2, 2024 (P002)</th>
                            <!-- Tambahkan periode lain di sini -->
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">C1: Current Ratio (%)</td>
                            <td class="px-4 py-3 whitespace-nowrap text-center">150%</td>
                            <td class="px-4 py-3 whitespace-nowrap text-center">175%</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">C2: Debt to Equity Ratio (x)</td>
                            <td class="px-4 py-3 whitespace-nowrap text-center">0.5x</td>
                            <td class="px-4 py-3 whitespace-nowrap text-center">0.3x</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">C3: Return on Equity (%)</td>
                            <td class="px-4 py-3 whitespace-nowrap text-center">20%</td>
                            <td class="px-4 py-3 whitespace-nowrap text-center">25%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Fungsi untuk Proses Perhitungan SAW
function getPerhitunganUI() {
    // Data dummy untuk simulasi
    const dummyResult = [
        { kode: 'P002', periode: 'Kuarta 2, 2024', skor_preferensi: 0.9500, status: 'SEHAT', color: 'text-green-600', isBest: true },
        { kode: 'P001', periode: 'Kuarta 1, 2024', skor_preferensi: 0.8200, status: 'CUKUP SEHAT', color: 'text-yellow-600', isBest: false },
        { kode: 'P003', periode: 'Tahun 2023', skor_preferensi: 0.7500, status: 'TIDAK SEHAT', color: 'text-red-600', isBest: false },
    ];

    const rankList = dummyResult.map((item, index) => `
        <tr class="hover:bg-gray-50 ${item.isBest ? 'bg-green-50' : ''}">
            <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-semibold ${item.isBest ? 'text-green-700 text-base' : 'text-gray-900'}">${index + 1}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${item.kode}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">${item.periode}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold ${item.color}">${item.skor_preferensi.toFixed(4)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold ${item.color}">${item.status}</td>
        </tr>
    `).join('');

    return `
        <div class="bg-white p-6 rounded-xl shadow-lg mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Langkah 1: Normalisasi Matriks dan Penentuan Skor Preferensi</h3>
            
            <div class="mb-6 flex justify-between items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p class="text-sm text-yellow-800 font-medium">Klik tombol di bawah untuk memulai perhitungan SAW berdasarkan data Rasio dan Bobot terbaru.</p>
                <button class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150">
                    Hitung Ulang Kesehatan Keuangan
                </button>
            </div>

            <h3 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Langkah 2: Perangkingan Akhir ($V_i$)</h3>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 border">
                    <thead class="bg-indigo-100">
                        <tr>
                            <th class="px-4 py-3 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider">Rank</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Kode</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Periode Evaluasi</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Skor Preferensi ($V_i$)</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Kategori</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${rankList}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Fungsi untuk Hasil Keputusan
function getHasilUI() {
    return `
        <div class="bg-white p-6 rounded-xl shadow-lg mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Hasil Keputusan Kesehatan Keuangan Terkini</h3>
            
            <div class="p-6 bg-green-50 border-l-4 border-green-600 rounded-lg mb-6">
                <p class="text-sm font-semibold text-green-600">Hasil Evaluasi Periode: Kuarta 2, 2024 (Skor Tertinggi)</p>
                <div class="flex items-center mt-2">
                    <svg class="w-8 h-8 text-green-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 4.016A11.954 11.954 0 002.944 12c0 4.97 4.029 9 9 9s9-4.03 9-9c0-2.485-1.008-4.73-2.618-6.384z"></path></svg>
                    <div>
                        <p class="text-2xl font-bold text-green-800">Kategori Kesehatan: SEHAT</p>
                        <p class="text-lg text-green-600">Skor Preferensi: 0.9500</p>
                    </div>
                </div>
            </div>

            <h4 class="text-lg font-semibold text-gray-700 mb-3">Riwayat Kategori Kesehatan Keuangan</h4>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 border">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor Tertinggi</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Hitung</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Kuarta 1, 2024</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-indigo-600">0.8200</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-yellow-600 font-semibold">CUKUP SEHAT</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">2024-04-15</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Tahun 2023</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-indigo-600">0.7500</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-red-600 font-semibold">TIDAK SEHAT</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">2023-12-30</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Fungsi untuk Manajemen Admin (Tidak berubah, karena ini adalah fungsi sistem)
function getManajemenAdminUI() {
    return `
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <div class="flex justify-between items-center mb-4">
                <p class="text-gray-600">Kelola daftar pengguna Admin (CRUD Admin) untuk mengakses sistem ini.</p>
                <button class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150">
                    + Tambah Admin Baru
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Super Admin Utama</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">superadmin</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-pink-600 font-semibold">Super Admin</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                <button class="text-red-600 hover:text-red-900" disabled>Hapus</button>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Staf Keuangan</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">keuangan</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">Admin</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                <button class="text-red-600 hover:text-red-900">Hapus</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}