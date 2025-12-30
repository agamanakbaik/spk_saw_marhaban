// ============================
// KONFIGURASI DASAR FRONTEND
// ============================
const API_BASE_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");
console.log("Token FE:", token);
const user = JSON.parse(localStorage.getItem("user") || "null");
const mainHeader = document.querySelector('#page-content-wrapper header');
let myWeightedChart = null; // Variabel global untuk chart di 'Hasil Perhitungan'
let myDashboardChart = null; // Variabel global untuk chart di 'Dashboard'
let globalChatHistory = []; // <--- Tambahkan ini untuk menyimpan chat sementara
let globalCalculationData = null; // Menyimpan hasil hitung
let myRadarChart = null; // Chart untuk modal detail
let selectedFilterId = ""; // Menyimpan ID Admin yang dipilih Superadmin
let currentPageName = "dashboard"; // Menyimpan halaman aktif agar bisa di-refresh

// Helper untuk membuat URL dinamis (Otomatis nempel ?filter_id=...)
function getApiUrl(endpoint) {
    let url = `${API_BASE_URL}${endpoint}`;
    if (user.role === 'superadmin' && selectedFilterId) {
        // Cek apakah sudah ada query param (?)
        url += (url.includes('?') ? '&' : '?') + `filter_id=${selectedFilterId}`;
    }
    return url;
}

// Fungsi Refresh Halaman Aktif (Dipanggil saat ganti dropdown)
function refreshCurrentPage() {
    loadContent(currentPageName);
}

// ==========================================
// MENCEGAH TOMBOL BACK/FORWARD (BFCache)
// ==========================================
window.addEventListener('pageshow', function(event) {
    // Jika user menekan tombol Back/Forward dan halaman dimuat dari cache memori
    if (event.persisted) {
        // Paksa reload halaman untuk memicu pengecekan token ulang
        window.location.reload();
    }
});

// ==========================================
// CEK SESI / TOKEN (Jika belum login, redirect ke login.html)
// ==========================================
if (!token) {
    // Fungsi untuk membuat dan memunculkan modal sesi habis
    const showSessionExpiredModal = () => {
        // 1. Buat elemen div untuk wrapper modal
        const modal = document.createElement('div');
        // Set class Tailwind untuk overlay (gelap & blur)
        modal.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 font-sans animate-fade-in";

        // 2. Isi HTML Modal (Kartu Cantik)
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center relative overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all scale-100">
                
                <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
                <div class="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div class="absolute -bottom-12 -left-12 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div class="relative z-10 mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 dark:bg-red-900/20 mb-6 shadow-sm ring-1 ring-red-100 dark:ring-red-900/30">
                    <i class="bi bi-shield-lock-fill text-4xl text-red-500 dark:text-red-400 drop-shadow-sm"></i>
                </div>
                
                <h3 class="relative z-10 text-2xl font-bold text-gray-800 dark:text-white mb-2 tracking-tight">Sesi Berakhir</h3>
                <p class="relative z-10 text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
                    Maaf, sesi login Anda telah habis demi keamanan. Silakan masuk kembali untuk melanjutkan akses.
                </p>
                
                <button id="btnLoginRedirect" class="relative z-10 group w-full py-3.5 px-4 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                    <span>Login Ulang</span>
                    <i class="bi bi-box-arrow-in-right text-lg group-hover:translate-x-1 transition-transform"></i>
                </button>
            </div>
        `;

        // 3. Masukkan ke dalam Body HTML
        // Cek apakah body sudah siap
        if (document.body) {
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden'; // Kunci scroll agar tidak bisa digerakkan

            // Tambahkan event klik pada tombol
            setTimeout(() => {
                const btn = document.getElementById('btnLoginRedirect');
                if (btn) {
                    btn.focus(); // Fokus ke tombol
                    btn.onclick = () => {
                        window.location.href = "login.html"; // Redirect saat tombol diklik
                    };
                }
            }, 50);
        } else {
            // Jika script dijalankan di <head>, tunggu konten dimuat
            window.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(modal);
                document.getElementById('btnLoginRedirect').onclick = () => window.location.href = "login.html";
            });
        }
    };

    // Jalankan fungsi modal
    showSessionExpiredModal();

    // PENTING: Hentikan eksekusi script selanjutnya agar tidak error karena token kosong
    throw new Error("Sesi habis. Script dihentikan untuk menunggu login ulang.");
}

// Tampilkan nama user
document.getElementById("userNameDisplay").textContent = user.username;

// ============================
// LOGIKA TAMPILAN BERDASARKAN ROLE
// ============================
const labelSuperAdmin = document.getElementById("label-superadmin");
const menuManajemen = document.getElementById("menu-manajemen-admin");
const menuBackup = document.getElementById("menu-backup-db");
const labelMainPanel = document.getElementById("label-main-panel");
const menuSettingsNavbar = document.getElementById("menu-settings-web"); // ID dari index.html

if (user.role !== "superadmin") {
    // === JIKA LOGIN SEBAGAI ADMIN BIASA ===

    // 1. Sembunyikan menu Sidebar khusus Super Admin
    if (labelSuperAdmin) labelSuperAdmin.style.display = "none";
    if (menuManajemen) menuManajemen.style.display = "none";
    if (menuBackup) menuBackup.style.display = "none";

    // 2. Sembunyikan menu "Tampilan Toko" di Navbar (Panah Bawah)
    if (menuSettingsNavbar) menuSettingsNavbar.classList.add("hidden");

    // 3. Judul pembatas bawah tetap "Admin Panel"
    if (labelMainPanel) labelMainPanel.textContent = "ADMIN PANEL";

} else {
    // === JIKA LOGIN SEBAGAI SUPER ADMIN ===

    // 1. Tampilkan menu Sidebar khusus
    if (menuManajemen) menuManajemen.style.display = "flex";
    if (menuBackup) menuBackup.style.display = "flex";

    if (labelSuperAdmin) {
        labelSuperAdmin.style.display = "block";
        labelSuperAdmin.textContent = "SYSTEM SETTINGS";
    }

    // 2. Tampilkan menu "Tampilan Toko" di Navbar
    if (menuSettingsNavbar) menuSettingsNavbar.classList.remove("hidden");

    // 3. Ubah judul pembatas bawah
    if (labelMainPanel) labelMainPanel.textContent = "SUPER ADMIN PANEL";
    // --- TAMBAHAN: Load List Admin untuk Dropdown ---
    const filterArea = document.getElementById("superadmin-filter-area");
    const filterSelect = document.getElementById("adminFilterSelect");

    if (filterArea && filterSelect) {
        filterArea.classList.remove("hidden"); // Tampilkan Filter Area

        // Fetch daftar admin
        fetch(`${API_BASE_URL}/auth/list-admin`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    filterSelect.innerHTML = '<option value="">-- Pilih Target Admin --</option>';
                    res.data.forEach(admin => {
                        filterSelect.innerHTML += `<option value="${admin.id}">${admin.username}</option>`;
                    });

                    // Event Listener saat dropdown berubah
                    filterSelect.addEventListener('change', (e) => {
                        selectedFilterId = e.target.value;
                        if (!selectedFilterId) {
                            showToast("Tampilan kembali kosong (Belum pilih admin)", "warning");
                        } else {
                            showToast(`Memuat data milik Admin ID: ${selectedFilterId}`);
                        }
                        refreshCurrentPage(); // Reload halaman otomatis
                    });
                }
            })
            .catch(err => console.error("Gagal load list admin:", err));
    }
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    // 1. Hapus data sesi
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2. Gunakan REPLACE agar halaman dashboard "dihapus" dari riwayat browser
    // Jadi tombol Back tidak akan berfungsi untuk kembali ke dashboard
    window.location.replace("login.html");
});

// ============================
// LOAD HALAMAN SPA
// ============================
window.loadContent = async(page) => {
        const container = document.getElementById("content-container");
        const filterArea = document.getElementById("superadmin-filter-area");
        if (filterArea) {
            // Daftar halaman di mana filter HARUS DISEMBUNYIKAN
            const hiddenPages = ['manajemen-admin', 'backup-db', 'chatbot'];

            // Jika user adalah superadmin DAN halaman tidak termasuk yang disembunyikan -> Tampilkan
            if (user.role === 'superadmin' && !hiddenPages.includes(page)) {
                filterArea.classList.remove('hidden');
            } else {
                // Selain itu (misal halaman manajemen admin atau user biasa) -> Sembunyikan
                filterArea.classList.add('hidden');
            }
        }
        if (mainHeader) {
            mainHeader.classList.add('shadow-md');
        }
        container.innerHTML = `<div class="p-8 text-gray-500 dark:text-gray-400 text-center">Memuat...</div>`;

        try {
            // ======================
            // DASHBOARD (UPDATED: TAMBAH NAVIGASI ALTERNATIF)
            // ======================
            // ======================
            // DASHBOARD (FIXED: Filter & Struktur Data)
            // ======================
            if (page === "dashboard") {
                currentPageName = "dashboard";

                // 1. Render Skeleton / Loading Awal
                container.innerHTML = `
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
                    </div>
                    <p class="text-lg text-gray-600 dark:text-gray-300 mb-6">Selamat datang, <b>${user.username}</b>!</p>
                    <div id="dashboard-content" class="text-center p-8 text-indigo-600 dark:text-indigo-400">
                        <div class="spinner mr-2" style="display:inline-block; width: 1.5rem; height: 1.5rem; border: 3px solid rgba(99, 102, 241, 0.3); border-radius: 50%; border-top-color: #6366F1;"></div>
                        Memuat data dashboard...
                    </div>
                `;

                // 2. LOGIKA STRICT SUPERADMIN (Cek Filter)
                if (user.role === 'superadmin' && !selectedFilterId) {
                    container.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-96 text-center text-gray-500">
                            <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-3">
                                <i class="bi bi-person-badge text-6xl text-indigo-300"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-700 dark:text-gray-200">Mode Superadmin</h2>
                            <p class="mb-4 text-gray-500 dark:text-gray-400">Silakan pilih <b>Admin Target</b> di menu atas untuk melihat Ringkasan Dashboard.</p>
                        </div>`;
                    return;
                }

                try {
                    // 3. FETCH DATA (Gunakan getApiUrl agar filter terbawa)
                    const [altRes, kritRes, calcRes] = await Promise.all([
                        fetch(getApiUrl('/alternatif'), { headers: { Authorization: `Bearer ${token}` } }),
                        fetch(getApiUrl('/kriteria'), { headers: { Authorization: `Bearer ${token}` } }),
                        fetch(getApiUrl('/perhitungan/hitung'), { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
                    ]);

                    const altJson = await altRes.json();
                    const kritJson = await kritRes.json();
                    const calcJson = await calcRes.json();

                    // 4. PARSING DATA (FIXED: Handle wrapper 'data' & 'success')

                    // Ambil array alternatif
                    const altData = altJson.data || altJson || [];

                    // Ambil array kriteria
                    const kritData = kritJson.data || kritJson || [];

                    // Ambil data perhitungan (Ini yang sering bikin error)
                    // Backend mengirim: { success: true, data: { ranking: [], ... } }
                    // Jadi kita harus ambil calcJson.data
                    const dataPerhitungan = calcJson.data || calcJson;
                    const ranking = dataPerhitungan.ranking || [];

                    // Cek jika perhitungan belum ada hasil (ranking kosong)
                    if (!calcRes.ok || ranking.length === 0) {
                        throw new Error("Data perhitungan belum tersedia.");
                    }

                    // 5. Hitung Summary
                    const totalAlternatif = altData.length;
                    const totalKriteria = kritData.length;
                    const peringkatSatu = ranking.find(r => r.rank === 1) || { alternatif_nama: "Belum Ada", nilai: 0 };

                    // 6. Render Konten Utama
                    const dashboardHTML = `
                        <div class="flex justify-between items-center mb-4 animate-fade-in">
                            <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
                        </div>
                        <p class="text-lg text-gray-600 dark:text-gray-300 mb-6">Selamat datang, <b>${user.username}</b>!</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-green-500 transform hover:-translate-y-1 transition duration-300">
                                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Peringkat #1 (Juara)</h3>
                                <div class="flex items-start justify-between">
                                    <div class="mr-2">
                                        <p class="text-2xl font-bold text-gray-900 dark:text-white break-words leading-tight" title="${peringkatSatu.alternatif_nama}">
                                            ${peringkatSatu.alternatif_nama}
                                        </p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Skor: <span class="font-mono font-bold text-green-600">${peringkatSatu.nilai.toFixed(4)}</span></p>
                                    </div>
                                    <div class="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400 flex-shrink-0">
                                        <i class="bi bi-trophy-fill text-xl"></i>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500 transform hover:-translate-y-1 transition duration-300">
                                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Alternatif</h3>
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-3xl font-bold text-gray-900 dark:text-white">${totalAlternatif}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Jumlah data saat ini</p>
                                    </div>
                                    <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400 flex-shrink-0">
                                        <i class="bi bi-people-fill text-xl"></i>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-yellow-500 transform hover:-translate-y-1 transition duration-300">
                                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Kriteria</h3>
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-3xl font-bold text-gray-900 dark:text-white">${totalKriteria}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Syarat penilaian</p>
                                    </div>
                                    <div class="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full text-yellow-600 dark:text-yellow-400 flex-shrink-0">
                                        <i class="bi bi-list-check text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-700">Grafik Perolehan Skor</h3>
                            <div style="height: 350px;">
                                <canvas id="dashboard-chart"></canvas>
                            </div>
                        </div>

                        <div class="cetak-sembunyi">
                            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Menu Cepat</h3>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button onclick="loadContent('alternatif')" class="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center gap-2 transition group">
                                    <i class="bi bi-people text-2xl text-indigo-500 group-hover:scale-110 transition-transform"></i>
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Data Alternatif</span>
                                </button>
                                <button onclick="loadContent('kriteria')" class="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center gap-2 transition group">
                                    <i class="bi bi-sliders text-2xl text-pink-500 group-hover:scale-110 transition-transform"></i>
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Data Kriteria</span>
                                </button>
                                <button onclick="loadContent('penilaian')" class="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center gap-2 transition group">
                                    <i class="bi bi-pencil-square text-2xl text-blue-500 group-hover:scale-110 transition-transform"></i>
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Input Nilai</span>
                                </button>
                                <button onclick="loadContent('perhitungan')" class="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center gap-2 transition group">
                                    <i class="bi bi-bar-chart-fill text-2xl text-green-500 group-hover:scale-110 transition-transform"></i>
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Hasil Akhir</span>
                                </button>
                            </div>
                        </div>
                    `;

                    container.innerHTML = dashboardHTML;
                    renderDashboardChart(ranking);

                } catch (err) {
                    console.error("Gagal memuat dashboard:", err);

                    // Tampilan Error / Data Belum Siap yang Cantik
                    container.innerHTML = `
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
                        </div>
                        <p class="text-lg text-gray-600 dark:text-gray-300 mb-6">Selamat datang, <b>${user.username}</b>!</p>
                        
                        <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded-lg shadow-sm">
                            <div class="flex items-start">
                                <div class="flex-shrink-0">
                                    <i class="bi bi-info-circle-fill text-yellow-500 text-2xl"></i>
                                </div>
                                <div class="ml-4">
                                    <h3 class="text-lg font-bold text-yellow-800 dark:text-yellow-200">Data Belum Lengkap</h3>
                                    <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                        <p class="mb-2">Sistem belum dapat menampilkan ringkasan karena:</p>
                                        <ul class="list-disc list-inside space-y-1 ml-1">
                                            <li>Data Alternatif atau Kriteria mungkin masih kosong.</li>
                                            <li>Penilaian belum diisi lengkap.</li>
                                            <li>Tombol "Hitung" di menu Hasil belum ditekan.</li>
                                        </ul>
                                    </div>
                                    <div class="mt-4">
                                        <button onclick="loadContent('penilaian')" class="text-sm font-bold text-yellow-800 hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100 underline">
                                            Pergi ke Input Penilaian &rarr;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                return;
            }

            // ======================
            // DATA ALTERNATIF (UPDATED: SUPPORT SUPERADMIN FILTER)
            // ======================
            if (page === "alternatif") {
                // 1. Set nama halaman aktif agar fungsi refresh global bekerja
                currentPageName = "alternatif";

                let allAlternatifData = [];

                // 2. Render Kerangka Halaman
                container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                
                <div class="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                    
                    <div class="flex items-center gap-3 w-full md:w-auto">
                        <h2 class="text-xl font-bold text-gray-800 dark:text-white">Data Alternatif</h2>
                        <span id="totalDataBadge" class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold hidden">0</span>
                    </div>

                    <div class="flex flex-col md:flex-row w-full md:w-auto items-center gap-3">
                        <div class="relative w-full md:w-64 group">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-500 transition">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text" id="searchAlt" placeholder="Cari data..." 
                                class="pl-10 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition outline-none">
                        </div>

                        <div class="flex gap-2 w-full md:w-auto">
                            <button id="btnDeleteAll" class="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition flex items-center justify-center dark:bg-gray-800 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20">
                                <i class="bi bi-trash3 mr-2"></i> Reset
                            </button>
                            <button id="btnAddAlt" class="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center justify-center shadow-sm">
                                <i class="bi bi-plus-lg mr-2"></i> Tambah Data
                            </button>
                        </div>
                    </div>
                </div>

                <div id="altTable" class="overflow-x-auto min-h-[300px]">
                    <div class="p-10 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                        <span class="spinner-border mb-2"></span>
                        <span>Memuat data...</span>
                    </div>
                </div>
            </div>
        `;

                const tableContainer = document.getElementById("altTable");
                const btnAdd = document.getElementById("btnAddAlt");
                const btnDeleteAll = document.getElementById("btnDeleteAll");
                const searchInput = document.getElementById("searchAlt");
                const badgeTotal = document.getElementById("totalDataBadge");

                // 3. Load Data Awal
                await loadAlternatifData();

                // === EVENT LISTENERS ===
                btnAdd.addEventListener("click", () => showAltModal());

                searchInput.addEventListener("input", (e) => {
                    const keyword = e.target.value.toLowerCase();
                    const filteredData = allAlternatifData.filter(item =>
                        item.kode_alternatif.toLowerCase().includes(keyword) ||
                        item.nama_periode.toLowerCase().includes(keyword) ||
                        (item.deskripsi && item.deskripsi.toLowerCase().includes(keyword))
                    );
                    renderAlternatifTable(filteredData);
                });

                btnDeleteAll.addEventListener("click", async() => {
                    if (allAlternatifData.length === 0) return showToast("Data kosong.", "error");
                    const confirmed = await showConfirm("Hapus Semua?", "PERINGATAN: Semua data alternatif (sesuai tampilan saat ini) akan dihapus permanen.");
                    if (!confirmed) return;

                    const originalContent = btnDeleteAll.innerHTML;
                    btnDeleteAll.disabled = true;
                    btnDeleteAll.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

                    try {
                        const deletePromises = allAlternatifData.map(item =>
                            fetch(`${API_BASE_URL}/alternatif/${item.id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` }
                            })
                        );
                        await Promise.all(deletePromises);
                        showToast("Data berhasil di-reset!", "success");
                        await loadAlternatifData();
                    } catch (err) {
                        console.error(err);
                        showToast("Gagal menghapus sebagian data.", "error");
                        await loadAlternatifData();
                    } finally {
                        btnDeleteAll.disabled = false;
                        btnDeleteAll.innerHTML = originalContent;
                    }
                });

                // === FUNCTIONS UTAMA ===

                async function loadAlternatifData() {
                    try {
                        // --- LOGIKA STRICT FILTER SUPERADMIN ---
                        // Jika login sebagai Superadmin TAPI belum memilih admin di dropdown
                        if (user.role === 'superadmin' && !selectedFilterId) {
                            tableContainer.innerHTML = `
                                <div class="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                    <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-3">
                                        <i class="bi bi-person-badge text-3xl text-indigo-500"></i>
                                    </div>
                                    <p class="text-lg font-bold">Mode Penampil Superadmin</p>
                                    <p class="text-sm">Silakan pilih <b class="text-indigo-600 dark:text-indigo-400">Target Admin</b> pada menu filter di atas untuk melihat data.</p>
                                </div>
                            `;
                            badgeTotal.innerText = "0";
                            badgeTotal.classList.add('hidden');
                            allAlternatifData = []; // Kosongkan data lokal
                            return;
                        }
                        // ---------------------------------------

                        // Tentukan URL: Jika superadmin & ada filter, tambahkan query param
                        let url = `${API_BASE_URL}/alternatif`;
                        if (user.role === 'superadmin' && selectedFilterId) {
                            url += `?filter_id=${selectedFilterId}`;
                        }

                        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                        const data = await res.json();

                        // Handle jika response array atau object { data: [] }
                        allAlternatifData = (data.data || data || []).sort((a, b) => a.id - b.id);

                        badgeTotal.innerText = allAlternatifData.length;
                        badgeTotal.classList.remove('hidden');

                        renderAlternatifTable(allAlternatifData);
                    } catch (err) {
                        console.error(err);
                        tableContainer.innerHTML = `<div class="p-10 text-center text-red-500">Gagal terhubung ke server.<br><small>${err.message}</small></div>`;
                    }
                }

                function renderAlternatifTable(data) {
                    if (!data.length) {
                        tableContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                    <div class="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-full mb-3">
                        <i class="bi bi-folder2-open text-3xl text-gray-400 dark:text-gray-500"></i>
                    </div>
                    <p class="text-sm font-medium">Tidak ada data ditemukan.</p>
                </div>`;
                        return;
                    }

                    const rows = data.map((a, index) => `
                <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center w-16 font-mono">${index + 1}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 dark:bg-blue-900/30 dark:text-blue-400">
                                ${a.kode_alternatif}
                            </div>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">${a.nama_periode}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        ${a.deskripsi ? `<span class="truncate max-w-xs block" title="${a.deskripsi}">${a.deskripsi}</span>` : '<span class="text-gray-300 italic">-</span>'}
                    </td>
                    
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex justify-end gap-2">
                            <button onclick='editAlt(${JSON.stringify(a)})' 
                                class="px-4 py-1.5 text-xs font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-md shadow-sm transition-colors">
                                Edit
                            </button>

                            <button onclick='deleteAlt(${a.id})' 
                                class="px-4 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-md shadow-sm transition-colors">
                                Hapus
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");

                    tableContainer.innerHTML = `
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm">
                        <tr>
                            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alternatif</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deskripsi</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Opsi</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        ${rows}
                    </tbody>
                </table>
            `;
                }

                // === MODAL & CRUD (TETAP SAMA) ===
                window.showAltModal = (data = {}) => {
                    const modal = document.getElementById("modal-container");
                    modal.classList.remove("hidden");
                    modal.classList.add("flex");
                    modal.innerHTML = `
                  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md m-auto transform transition-all duration-300 scale-100 overflow-hidden">
                      <div class="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                          <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                             <i class="bi bi-layers text-blue-600"></i> ${data.id ? "Edit Data" : "Data Baru"}
                          </h3>
                          <button onclick="closeAltModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl leading-none transition">&times;</button>
                      </div>
                      <form id="altForm">
                          <div class="p-6 space-y-4">
                              <input type="hidden" id="altId" value="${data.id || ""}">
                              <div>
                                  <label for="kodeAlt" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Kode Alternatif</label>
                                  <input type="text" id="kodeAlt" value="${data.kode_alternatif || ""}" class="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" required placeholder="Contoh: A1">
                              </div>
                              <div>
                                  <label for="namaAlt" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nama Periode</label>
                                  <input type="text" id="namaAlt" value="${data.nama_periode || ""}" class="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" required placeholder="Contoh: Januari 2024">
                              </div>
                              <div>
                                  <label for="descAlt" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Deskripsi (Opsional)</label>
                                  <textarea id="descAlt" rows="3" class="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Keterangan tambahan...">${data.deskripsi || ""}</textarea>
                              </div>
                          </div>
                          <div class="p-5 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
                              <button type="button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 transition" onclick="closeAltModal()">Batal</button>
                              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition flex items-center">
                                <i class="bi bi-check-lg mr-1"></i> Simpan
                              </button>
                          </div>
                      </form>
                  </div>
                `;
                    document.getElementById("altForm").addEventListener("submit", saveAlt);
                };

                window.closeAltModal = () => {
                    document.getElementById("modal-container").classList.add("hidden");
                    document.getElementById("modal-container").innerHTML = "";
                };

                async function saveAlt(e) {
                    e.preventDefault();
                    
                    // Validasi: Superadmin harus pilih admin dulu sebelum nambah data (Opsional, tapi disarankan)
                    if (user.role === 'superadmin' && !selectedFilterId) {
                        showToast("Pilih Admin Target terlebih dahulu di menu atas!", "error");
                        return;
                    }

                    const id = document.getElementById("altId").value;
                    const payload = {
                        kode_alternatif: document.getElementById("kodeAlt").value,
                        nama_periode: document.getElementById("namaAlt").value,
                        deskripsi: document.getElementById("descAlt").value,
                    };

                    // Jika Superadmin sedang memfilter admin tertentu, kirim ID targetnya
                    if (user.role === 'superadmin' && selectedFilterId) {
                        payload.target_admin_id = selectedFilterId;
                    }
                    
                    const url = id ? `${API_BASE_URL}/alternatif/${id}` : `${API_BASE_URL}/alternatif`;
                    const method = id ? "PUT" : "POST";
                    
                    try {
                        const res = await fetch(url, {
                            method,
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify(payload),
                        });
                        const result = await res.json();
                        if (!res.ok) throw new Error(result.message);
                        showToast(result.message || "Berhasil disimpan!");
                        closeAltModal();
                        await loadAlternatifData();
                    } catch (err) {
                        console.error(err);
                        showToast(`Terjadi kesalahan: ${err.message}`, "error");
                    }
                }

                window.editAlt = (data) => showAltModal(data);
                window.deleteAlt = async (id) => {
                    const confirmed = await showConfirm("Hapus Data", "Yakin ingin menghapus data alternatif ini?");
                    if (!confirmed) return;
                    try {
                        const res = await fetch(`${API_BASE_URL}/alternatif/${id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const result = await res.json();
                        if (!res.ok) throw new Error(result.message);
                        showToast(result.message || "Data berhasil dihapus!");
                        await loadAlternatifData();
                    } catch (err) {
                        console.error(err);
                        showToast(`Gagal menghapus data: ${err.message}`, "error");
                    }
                };
                return;
            }
    
    // ======================
            // DATA KRITERIA (UPDATED: SUPPORT SUPERADMIN FILTER)
            // ======================
            if (page === "kriteria") {
                // 1. Set nama halaman aktif agar fungsi refresh global bekerja
                currentPageName = "kriteria";
                
                let allKriteriaData = []; 
                window.currentKriteriaId = null;

                // 2. RENDER CONTAINER UTAMA
                container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                
                <div id="mainToolbar" class="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                    
                    <div class="flex items-center gap-3 w-full md:w-auto">
                        <h2 id="pageTitle" class="text-xl font-bold text-gray-800 dark:text-white">Data Kriteria</h2>
                        <span id="totalKriteriaBadge" class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold hidden">0</span>
                    </div>

                    <div class="flex flex-col md:flex-row w-full md:w-auto items-center gap-3">
                        
                        <div class="relative w-full md:w-64 group">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-500 transition">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text" id="searchKrit" placeholder="Cari kriteria..." 
                                class="pl-10 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition outline-none">
                        </div>

                        <div class="flex gap-2 w-full md:w-auto">
                            <button id="btnDeleteAllKrit" class="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-red-500 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition flex items-center justify-center shadow-sm dark:bg-gray-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                                <i class="bi bi-trash3 mr-2"></i> Reset
                            </button>

                            <button id="btnAddKrit" class="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center justify-center shadow-sm">
                                <i class="bi bi-plus-lg mr-2"></i> Tambah Kriteria
                            </button>
                        </div>
                    </div>
                </div>

                <div id="kritTable" class="overflow-x-auto min-h-[300px]">
                    <div class="p-10 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                        <span class="spinner-border mb-2"></span>
                        <span>Memuat data...</span>
                    </div>
                </div>
            </div>
        `;

                const tableContainer = document.getElementById("kritTable");
                const btnAdd = document.getElementById("btnAddKrit");
                const btnDeleteAll = document.getElementById("btnDeleteAllKrit");
                const searchInput = document.getElementById("searchKrit");
                const badgeTotal = document.getElementById("totalKriteriaBadge");
                const pageTitle = document.getElementById("pageTitle");
                const mainToolbar = document.getElementById("mainToolbar");

                // 3. Load Data Awal
                await loadKriteriaData();

                // === EVENT LISTENER UTAMA ===
                btnAdd.addEventListener("click", () => showKritModal());
                
                searchInput.addEventListener("input", (e) => {
                    const keyword = e.target.value.toLowerCase();
                    const filteredData = allKriteriaData.filter(item => 
                        item.kode.toLowerCase().includes(keyword) ||
                        item.nama.toLowerCase().includes(keyword) ||
                        item.tipe.toLowerCase().includes(keyword)
                    );
                    renderKriteriaTable(filteredData);
                });

                btnDeleteAll.addEventListener("click", async () => {
                    if (allKriteriaData.length === 0) return showToast("Data kosong.", "error");
                    if (!await showConfirm("Hapus Semua?", "PERINGATAN: Semua kriteria DAN sub-kriterianya akan dihapus.")) return;

                    const originalContent = btnDeleteAll.innerHTML;
                    btnDeleteAll.disabled = true;
                    btnDeleteAll.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

                    try {
                        const deletePromises = allKriteriaData.map(item => 
                            fetch(`${API_BASE_URL}/kriteria/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
                        );
                        await Promise.all(deletePromises);
                        showToast("Semua data berhasil di-reset!", "success");
                        await loadKriteriaData();
                    } catch (err) {
                        showToast("Gagal menghapus sebagian data.", "error");
                        await loadKriteriaData();
                    } finally {
                        btnDeleteAll.disabled = false;
                        btnDeleteAll.innerHTML = originalContent;
                    }
                });

                // === FUNGSI LOAD DATA UTAMA ===
                
                async function loadKriteriaData() {
                    pageTitle.innerText = "Data Kriteria";
                    mainToolbar.style.display = "flex"; 
                    
                    try {
                        // --- LOGIKA STRICT FILTER SUPERADMIN ---
                        if (user.role === 'superadmin' && !selectedFilterId) {
                            tableContainer.innerHTML = `
                                <div class="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                    <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-3">
                                        <i class="bi bi-person-badge text-3xl text-indigo-500"></i>
                                    </div>
                                    <p class="text-lg font-bold">Mode Penampil Superadmin</p>
                                    <p class="text-sm">Silakan pilih <b class="text-indigo-600 dark:text-indigo-400">Target Admin</b> pada menu filter di atas untuk melihat data.</p>
                                </div>
                            `;
                            badgeTotal.innerText = "0";
                            badgeTotal.classList.add('hidden');
                            allKriteriaData = []; // Kosongkan data lokal
                            return;
                        }
                        // ---------------------------------------

                        // Tentukan URL: Jika superadmin & ada filter, tambahkan query param
                        let url = `${API_BASE_URL}/kriteria`;
                        if (user.role === 'superadmin' && selectedFilterId) {
                            url += `?filter_id=${selectedFilterId}`;
                        }

                        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                        const data = await res.json();
                        
                        // Handle jika response array atau object { data: [] }
                        allKriteriaData = (Array.isArray(data) ? data : data.data || []).sort((a,b) => a.id - b.id);
                        
                        badgeTotal.innerText = allKriteriaData.length;
                        badgeTotal.classList.remove('hidden');

                        renderKriteriaTable(allKriteriaData);
                    } catch (err) {
                        tableContainer.innerHTML = `<div class="p-10 text-center text-red-500">Gagal memuat data.<br><small>${err.message}</small></div>`;
                    }
                }
                window.loadKriteriaTable = loadKriteriaData; 

                function renderKriteriaTable(data) {
                    if (!data.length) {
                        tableContainer.innerHTML = `<div class="p-12 text-center text-gray-400">Tidak ada data kriteria.</div>`;
                        return;
                    }

                    const rows = data.map((k, index) => `
                <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                    <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center w-16 font-mono">${index + 1}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 dark:bg-blue-900/30 dark:text-blue-400">${k.kode}</div>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">${k.nama}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">${parseFloat(k.bobot)}</td>
                    <td class="px-6 py-4">
                        <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${k.tipe.toLowerCase() === 'benefit' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'}">${k.tipe}</span>
                    </td>
                    <td class="px-6 py-4 text-right text-sm font-medium">
                        <div class="flex justify-end gap-2">
                            <button onclick='openSubKriteria(${k.id}, "${k.nama}")' class="px-3 py-1.5 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm transition-colors">Sub Kriteria</button>
                            <button onclick='showKritModal(${JSON.stringify(k)})' class="px-4 py-1.5 text-xs font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-md shadow-sm transition-colors">Edit</button>
                            <button onclick='deleteKrit(${k.id})' class="px-4 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-md shadow-sm transition-colors">Hapus</button>
                        </div>
                    </td>
                </tr>
            `).join("");

                    tableContainer.innerHTML = `
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm">
                        <tr>
                            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">No</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kriteria</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Bobot</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tipe</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">${rows}</tbody>
                </table>
            `;
                }

                // ============================================
                // FUNGSI LOGIKA SUB KRITERIA (FIXED: PAKAI getApiUrl)
                // ============================================
                window.openSubKriteria = async function (id, namaKriteria) {
                    // 1. Simpan state
                    window.currentKriteriaId = id;
                    if(namaKriteria) window.currentKriteriaNama = namaKriteria;
                    
                    // 2. UI Setup
                    const mainToolbar = document.getElementById("mainToolbar");
                    const tableContainer = document.getElementById("kritTable");
                    if(mainToolbar) mainToolbar.style.display = "none"; 
                    tableContainer.innerHTML = `<div class="p-10 text-center"><span class="spinner-border text-blue-500"></span> Memuat sub kriteria...</div>`;
                    
                    try {
                        // 3. FETCH DATA (GUNAKAN getApiUrl AGAR FILTER TERBAWA)
                        // Ini perbaikan utamanya:
                        const url = getApiUrl(`/subkriteria?kriteria_id=${id}`);
                        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                        const data = await res.json();
                        
                        // Simpan data
                        let allSubData = (Array.isArray(data) ? data : data.data || []);
                        
                        // Default Sort
                        let isAscending = true;
                        allSubData.sort((a,b) => a.nilai - b.nilai);

                        // --- FUNGSI RENDER BARIS TABEL ---
                        const renderSubRows = (subData) => {
                            if (!subData || subData.length === 0) {
                                return `<tr><td colspan="5" class="p-12 text-center text-gray-400"><i class="bi bi-folder-x text-3xl mb-2"></i><br>Belum ada data sub kriteria.</td></tr>`;
                            }
                            
                            return subData.map((s, i) => `
                                <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                                    <td class="px-6 py-4 text-center text-sm text-gray-500 w-16 font-mono">${i + 1}</td>
                                    <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${s.nama}</td>
                                    <td class="px-6 py-4"><span class="inline-block px-2 py-1 text-xs font-bold text-gray-700 bg-gray-100 rounded border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">${s.nilai}</span></td>
                                    <td class="px-6 py-4 text-sm text-gray-500 italic">${s.keterangan || '-'}</td>
                                    <td class="px-6 py-4 text-right whitespace-nowrap">
                                        <div class="flex justify-end gap-2">
                                            <button onclick='showSubKritModal(${JSON.stringify({ ...s, kriteria_id: id })})' class="px-4 py-1.5 text-xs font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-md shadow-sm transition-colors">Edit</button>
                                            <button onclick='deleteSubKrit(${s.id}, ${id})' class="px-4 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-md shadow-sm transition-colors">Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join("");
                        };

                        // --- RENDER HEADER & FRAME TABEL ---
                        const subHeader = `
                            <div class="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center bg-blue-50/50 dark:bg-blue-900/10 gap-4">
                                <div class="flex items-center gap-4 w-full md:w-auto">
                                    <button onclick="loadKriteriaTable()" class="p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition shadow-sm" title="Kembali">
                                        <i class="bi bi-arrow-left text-lg"></i>
                                    </button>
                                    <div>
                                        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Sub Kriteria</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Untuk Kriteria: <b>${window.currentKriteriaNama}</b></p>
                                    </div>
                                </div>
                                
                                <div class="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
                                    <div class="relative w-full md:w-48">
                                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><i class="bi bi-search text-xs"></i></span>
                                        <input type="text" id="searchSubKrit" placeholder="Cari sub..." class="pl-8 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                    </div>
                                    <div class="flex gap-2">
                                        <button id="btnResetSub" class="px-3 py-2 text-sm font-medium text-red-500 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition flex items-center shadow-sm dark:bg-gray-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                                            <i class="bi bi-trash3 mr-1"></i> Reset
                                        </button>
                                        <button onclick='showSubKritModal({ kriteria_id: ${id} })' class="px-3 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition flex items-center">
                                            <i class="bi bi-plus-lg mr-1"></i> Tambah
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;

                        const renderTable = (rowsHtml) => `
                            ${subHeader}
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">No</th>
                                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nama Sub</th>
                                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer hover:text-blue-600 select-none group" id="sortNilaiHeader">
                                            Nilai <i id="sortIcon" class="bi bi-sort-numeric-down ml-1 text-gray-400 group-hover:text-blue-600"></i>
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ket</th>
                                        <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="subTableBody" class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">${rowsHtml}</tbody>
                            </table>
                        `;

                        tableContainer.innerHTML = renderTable(renderSubRows(allSubData));
                        
                        // Event Listeners (Sort, Search, Reset)
                        const sortHeader = document.getElementById('sortNilaiHeader');
                        const sortIcon = document.getElementById('sortIcon');
                        if(sortHeader) {
                            sortHeader.addEventListener('click', () => {
                                isAscending = !isAscending;
                                if (isAscending) { sortIcon.className = "bi bi-sort-numeric-down ml-1 text-blue-600"; } 
                                else { sortIcon.className = "bi bi-sort-numeric-up-alt ml-1 text-blue-600"; }
                                allSubData.sort((a, b) => isAscending ? a.nilai - b.nilai : b.nilai - a.nilai);
                                document.getElementById('subTableBody').innerHTML = renderSubRows(allSubData);
                            });
                        }
                        const searchInp = document.getElementById('searchSubKrit');
                        if(searchInp) {
                            searchInp.addEventListener('input', (e) => {
                                const keyword = e.target.value.toLowerCase();
                                const filtered = allSubData.filter(s => s.nama.toLowerCase().includes(keyword) || (s.keterangan && s.keterangan.toLowerCase().includes(keyword)));
                                document.getElementById('subTableBody').innerHTML = renderSubRows(filtered);
                            });
                        }
                        
                        // Logic Reset Sub
                        const btnResetSub = document.getElementById('btnResetSub');
                        if (btnResetSub) {
                            btnResetSub.addEventListener('click', async () => {
                                if (allSubData.length === 0) return showToast("Data kosong.", "error");
                                if (!await showConfirm("Reset Sub Kriteria?", `Hapus semua sub kriteria untuk "${window.currentKriteriaNama}"?`)) return;
                                try {
                                    const deletePromises = allSubData.map(item => fetch(`${API_BASE_URL}/subkriteria/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }));
                                    await Promise.all(deletePromises);
                                    showToast("Berhasil di-reset!", "success");
                                    openSubKriteria(id, window.currentKriteriaNama);
                                } catch (err) { showToast("Gagal reset.", "error"); }
                            });
                        }

                    } catch (err) {
                        showToast(`Gagal memuat sub kriteria: ${err.message}`, "error");
                        tableContainer.innerHTML = `<div class="p-10 text-center text-red-500">Gagal memuat data.</div>`;
                    }
                };

                // ============================================
                // MODAL & CRUD HELPER
                // ============================================
                window.showKritModal = (data = {}) => {
                    const modal = document.getElementById("modal-container"); modal.classList.remove("hidden"); modal.classList.add("flex");
                    modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md m-auto overflow-hidden">
                    <div class="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                        <h3 class="font-bold text-gray-800 dark:text-white">${data.id ? "Edit" : "Tambah"} Kriteria</h3>
                        <button onclick="closeKritModal()" class="text-gray-400 hover:text-red-500 text-2xl leading-none">&times;</button>
                    </div>
                    <form id="kritForm" class="p-6 space-y-4">
                        <input type="hidden" id="kritId" value="${data.id || ""}">
                        <div><label class="block text-xs font-bold text-gray-500 mb-1">KODE</label><input type="text" id="kodeKrit" value="${data.kode || ""}" class="w-full border rounded-lg p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="C1"></div>
                        <div><label class="block text-xs font-bold text-gray-500 mb-1">NAMA</label><input type="text" id="namaKrit" value="${data.nama || ""}" class="w-full border rounded-lg p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div><label class="block text-xs font-bold text-gray-500 mb-1">BOBOT</label><input type="number" id="bobotKrit" value="${parseFloat(data.bobot) || ""}" step="0.01" class="w-full border rounded-lg p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required></div>
                            <div><label class="block text-xs font-bold text-gray-500 mb-1">TIPE</label><select id="tipeKrit" class="w-full border rounded-lg p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"><option value="Benefit" ${data.tipe === "Benefit" ? "selected" : ""}>Benefit</option><option value="Cost" ${data.tipe === "Cost" ? "selected" : ""}>Cost</option></select></div>
                        </div>
                        <div class="pt-4 flex justify-end gap-2"><button type="button" onclick="closeKritModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Batal</button><button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm">Simpan</button></div>
                    </form>
                </div>`;
                    document.getElementById("kritForm").addEventListener("submit", saveKrit);
                };
                window.closeKritModal = () => { document.getElementById("modal-container").classList.add("hidden"); document.getElementById("modal-container").innerHTML = ""; };
                
                async function saveKrit(e) {
                    e.preventDefault(); 
                    
                    // Validasi Superadmin
                    if (user.role === 'superadmin' && !selectedFilterId) {
                        showToast("Pilih Admin Target terlebih dahulu di menu atas!", "error");
                        return;
                    }

                    const id = document.getElementById("kritId").value;
                    const payload = { 
                        kode: document.getElementById("kodeKrit").value, 
                        nama: document.getElementById("namaKrit").value, 
                        bobot: document.getElementById("bobotKrit").value, 
                        tipe: document.getElementById("tipeKrit").value 
                    };

                    // Sisipkan ID target jika Superadmin
                    if (user.role === 'superadmin' && selectedFilterId) {
                        payload.target_admin_id = selectedFilterId;
                    }
                    
                    const url = id ? `${API_BASE_URL}/kriteria/${id}` : `${API_BASE_URL}/kriteria`;
                    const method = id ? "PUT" : "POST";

                    try {
                        const res = await fetch(url, { method: method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
                        if (!res.ok) throw new Error((await res.json()).message);
                        showToast("Berhasil!"); closeKritModal(); loadKriteriaData();
                    } catch (err) { showToast(err.message, "error"); }
                }
                
                window.deleteKrit = async (id) => { 
                    if (await showConfirm("Hapus?", "Yakin?")) { 
                        try { 
                            await fetch(`${API_BASE_URL}/kriteria/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); 
                            showToast("Terhapus!"); 
                            loadKriteriaData(); 
                        } catch (e) { showToast(e.message, "error"); } 
                    } 
                };

                window.showSubKritModal = (data = {}) => {
                    const modal = document.getElementById("modal-container"); modal.classList.remove("hidden"); modal.classList.add("flex");
                    const kId = data.kriteria_id || window.currentKriteriaId;
                    modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm m-auto overflow-hidden">
                    <div class="p-4 border-b bg-gray-50 dark:bg-gray-700 flex justify-between"><h3 class="font-bold dark:text-white">Sub Kriteria</h3><button onclick="closeSubKritModal()" class="text-2xl">&times;</button></div>
                    <form id="subForm" class="p-5 space-y-3">
                        <input type="hidden" id="sId" value="${data.id || ''}"><input type="hidden" id="kId" value="${kId}">
                        <input class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" id="sNama" placeholder="Nama Sub" value="${data.nama || ''}" required>
                        <input class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" type="number" id="sNilai" placeholder="Nilai" value="${data.nilai || ''}" required>
                        <textarea class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" id="sKet" placeholder="Keterangan">${data.keterangan || ''}</textarea>
                        <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded font-bold">Simpan</button>
                    </form>
                </div>`;
                    document.getElementById("subForm").onsubmit = async (e) => {
                        e.preventDefault();
                        const p = { kriteria_id: parseInt(kId), nama: document.getElementById("sNama").value, nilai: parseInt(document.getElementById("sNilai").value), keterangan: document.getElementById("sKet").value };

                        if (user.role === 'superadmin' && selectedFilterId) {
                            p.target_admin_id = selectedFilterId;
                        }

                        const url = p.id = document.getElementById("sId").value;
                        try { await fetch(url ? `${API_BASE_URL}/subkriteria/${url}` : `${API_BASE_URL}/subkriteria`, { method: url ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(p) });
                            closeSubKritModal(); openSubKriteria(kId, document.getElementById("pageTitle").innerText.split(": ")[1] || "");
                        } catch (err) { showToast(err.message, "error"); }
                    };
                };
                window.closeSubKritModal = () => { document.getElementById("modal-container").classList.add("hidden"); document.getElementById("modal-container").innerHTML = ""; };
                window.deleteSubKrit = async (id, kId) => { if (await showConfirm("Hapus?", "Yakin?")) { try { await fetch(`${API_BASE_URL}/subkriteria/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); openSubKriteria(kId, document.getElementById("pageTitle").innerText.split(": ")[1] || ""); } catch (e) { showToast(e.message, "error"); } } };

                return;
            }

            // ======================
            // PENILAIAN ALTERNATIF (FINAL FIX)
            // ======================
            if (page === "penilaian") {
                currentPageName = "penilaian";

                // 1. Render Skeleton
                container.innerHTML = `
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[400px]">
                        <div class="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <h2 class="text-xl font-bold text-gray-800 dark:text-white">Penilaian Alternatif</h2>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Lengkapi nilai untuk setiap alternatif berdasarkan kriteria.</p>
                        </div>
                        <div id="penilaian-loader" class="flex flex-col items-center justify-center h-64 text-indigo-500">
                            <span class="spinner-border w-8 h-8 mb-3"></span>
                            <span class="text-gray-500 dark:text-gray-400 text-sm font-medium">Sedang memuat data...</span>
                        </div>
                        <div id="penilaian-content" class="hidden"></div>
                    </div>
                `;

                const loader = document.getElementById("penilaian-loader");
                const contentDiv = document.getElementById("penilaian-content");

                try {
                    // --- LOGIKA STRICT FILTER ---
                    if (user.role === 'superadmin' && !selectedFilterId) {
                        loader.classList.add('hidden');
                        contentDiv.classList.remove('hidden');
                        contentDiv.innerHTML = `
                            <div class="flex flex-col items-center justify-center h-64 text-gray-500">
                                <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-3">
                                    <i class="bi bi-person-badge text-3xl text-indigo-500"></i>
                                </div>
                                <p class="text-lg font-bold">Mode Penampil Superadmin</p>
                                <p class="text-sm">Silakan pilih <b class="text-indigo-600 dark:text-indigo-400">Target Admin</b> pada menu filter di atas untuk mengelola penilaian.</p>
                            </div>`;
                        return;
                    }

                    // 2. Fetch Data Utama
                    const [altRes, kritRes, penRes] = await Promise.all([
                        fetch(getApiUrl('/alternatif'), { headers: { Authorization: `Bearer ${token}` } }),
                        fetch(getApiUrl('/kriteria'), { headers: { Authorization: `Bearer ${token}` } }),
                        fetch(getApiUrl('/penilaian'), { headers: { Authorization: `Bearer ${token}` } }),
                    ]);

                    const altJson = await altRes.json();
                    const kritJson = await kritRes.json();
                    const penJson = await penRes.json();

                    const alternatifs = (altJson.data || altJson || []).sort((a, b) => a.id - b.id);
                    const kriterias = (kritJson.data || kritJson || []).sort((a, b) => a.id - b.id);
                    const penilaianData = penJson.data || penJson || [];

                    if (kriterias.length === 0 || alternatifs.length === 0) {
                        loader.classList.add('hidden');
                        contentDiv.classList.remove('hidden');
                        contentDiv.innerHTML = `<div class="p-10 text-center text-red-500 flex flex-col items-center"><i class="bi bi-exclamation-circle text-4xl mb-2"></i><p>Data Alternatif atau Kriteria masih kosong.</p></div>`;
                        return;
                    }

                    // 3. SIAPKAN SUB KRITERIA (FIXED: GUNAKAN getApiUrl)
                    // Ini bagian paling penting yang tadi salah
                    const subResList = await Promise.all(
                        kriterias.map(k => {
                            // getApiUrl akan otomatis menambahkan ?filter_id=... jika Superadmin
                            return fetch(getApiUrl(`/subkriteria?kriteria_id=${k.id}`), { 
                                headers: { Authorization: `Bearer ${token}` } 
                            });
                        })
                    );

                    const subKriteriaMap = new Map();
                    for (let i = 0; i < kriterias.length; i++) {
                        const subJson = await subResList[i].json();
                        // Urutkan: Nilai Terbesar di Atas
                        const subData = (subJson.data || subJson || []).sort((a, b) => b.nilai - a.nilai);
                        subKriteriaMap.set(kriterias[i].id, subData);
                    }

                    // 4. Mapping Nilai yang Sudah Ada
                    const penilaianMap = new Map();
                    penilaianData.forEach((p) => {
                        if (p.nilai !== undefined) penilaianMap.set(`${p.alternatif_id}-${p.kriteria_id}`, p.nilai);
                    });

                    // 5. Build Header Tabel
                    const tableHeaders = kriterias.map((k) => 
                        `<th class="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[220px] bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <div class="flex flex-col">
                                <span>${k.nama}</span>
                                <span class="text-[10px] font-normal text-gray-400 capitalize">${k.tipe} (${k.bobot}%)</span>
                            </div>
                        </th>`
                    ).join("");

                    // 6. Build Rows Tabel
                    const tableRows = alternatifs.map((a, index) => {
                        const kriteriaCells = kriterias.map((k) => {
                            const subKriterias = subKriteriaMap.get(k.id) || [];
                            const currentValue = penilaianMap.get(`${a.id}-${k.id}`);
                            
                            let currentShortLabel = "- Pilih -";
                            
                            const options = subKriterias.map((s) => {
                                const isSelected = s.nilai == currentValue ? "selected" : "";
                                if (s.nilai == currentValue) currentShortLabel = s.nama;
                                return `<option value="${s.nilai}" data-short="${s.nama}" ${isSelected}>${s.nama} (Nilai: ${s.nilai})</option>`;
                            }).join("");

                            // JIKA SUB KRITERIA KOSONG -> TAMPILKAN INPUT MANUAL (FALLBACK)
                            if (subKriterias.length === 0) {
                                return `
                                    <td class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 align-middle">
                                        <input type="number" 
                                            class="input-nilai w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                            data-alt-id="${a.id}" 
                                            data-krit-id="${k.id}"
                                            value="${currentValue || ''}"
                                            placeholder="Input Nilai"
                                        >
                                    </td>`;
                            }

                            // JIKA ADA SUB KRITERIA -> TAMPILKAN DROPDOWN CUSTOM
                            const uniqueId = `select-${a.id}-${k.id}`;
                            const labelId = `label-${a.id}-${k.id}`;
                            const wrapperId = `wrapper-${a.id}-${k.id}`;
                            
                            return `
                                <td class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 align-middle">
                                    <div class="relative w-full min-w-[180px]" id="${wrapperId}">
                                        
                                        <div class="custom-select-display flex items-center justify-between w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white pointer-events-none transition-colors">
                                            <span id="${labelId}" class="truncate mr-2">${currentShortLabel}</span>
                                            <i class="bi bi-chevron-down text-gray-400 text-xs"></i>
                                        </div>

                                        <select 
                                            id="${uniqueId}"
                                            class="input-nilai absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            data-alt-id="${a.id}" 
                                            data-krit-id="${k.id}"
                                            data-label-target="${labelId}"
                                            data-wrapper-target="${wrapperId}"
                                            required
                                            onchange="syncSelectDisplay(this)"
                                        >
                                            <option value="" data-short="- Pilih -">- Pilih -</option>
                                            ${options}
                                        </select>

                                    </div>
                                </td>
                            `;
                        }).join("");

                        return `
                            <tr class="hover:bg-indigo-50/30 dark:hover:bg-gray-700/50 transition duration-150 group">
                                <td class="px-6 py-4 text-center text-sm text-gray-500 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">${index + 1}</td>
                                <td class="px-6 py-4 whitespace-nowrap border-b border-gray-100 dark:border-gray-700 sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-indigo-50/30 dark:group-hover:bg-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    <div class="flex flex-col">
                                        <span class="text-sm font-bold text-gray-800 dark:text-white">${a.nama_periode}</span>
                                        <span class="text-xs text-gray-500 truncate max-w-[150px]">${a.deskripsi || '-'}</span>
                                    </div>
                                </td>
                                ${kriteriaCells}
                            </tr>
                        `;
                    }).join("");

                    contentDiv.innerHTML = `
                        <form id="penilaian-form" class="flex flex-col h-full">
                            <div class="overflow-auto max-h-[65vh] relative custom-scrollbar">
                                <table class="min-w-full border-collapse">
                                    <thead class="sticky top-0 z-20 shadow-sm">
                                        <tr>
                                            <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase w-16 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">No</th>
                                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase min-w-[200px] sticky left-0 z-30 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Alternatif</th>
                                            ${tableHeaders}
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        ${tableRows}
                                    </tbody>
                                </table>
                            </div>
                            <div class="p-5 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center z-30 sticky bottom-0">
                                <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg transition duration-200 flex justify-center items-center gap-2 transform active:scale-95">
                                    <i class="bi bi-floppy2-fill"></i> Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    `;

                    // === Helper UI Select ===
                    window.syncSelectDisplay = (selectElem) => {
                        const labelId = selectElem.getAttribute('data-label-target');
                        const wrapperId = selectElem.getAttribute('data-wrapper-target');
                        const labelElem = document.getElementById(labelId);
                        const wrapperElem = document.getElementById(wrapperId);
                        const displayDiv = wrapperElem.querySelector('.custom-select-display');

                        const selectedOption = selectElem.options[selectElem.selectedIndex];
                        const shortText = selectedOption.getAttribute('data-short') || "- Pilih -";

                        if(labelElem) labelElem.innerText = shortText;

                        if(selectElem.value !== "") {
                            displayDiv.classList.remove('border-red-500', 'bg-red-50', 'ring-2', 'ring-red-200');
                            displayDiv.classList.add('border-gray-300', 'bg-white');
                            displayDiv.classList.add('border-indigo-500', 'ring-1', 'ring-indigo-200');
                        }
                    };

                    loader.classList.add('hidden');
                    contentDiv.classList.remove('hidden');

                    // === HANDLE SUBMIT ===
                    document.getElementById("penilaian-form").addEventListener("submit", async (e) => {
                        e.preventDefault();
                        const btn = e.target.querySelector('button[type="submit"]');
                        const selects = e.target.querySelectorAll(".input-nilai");
                        
                        if (user.role === 'superadmin' && !selectedFilterId) {
                            showToast("Pilih Admin Target terlebih dahulu!", "error");
                            return;
                        }

                        let isValid = true;
                        let emptyCount = 0;
                        const payload = [];

                        selects.forEach((select) => {
                            const nilai = select.value;
                            const wrapperId = select.getAttribute('data-wrapper-target');

                            if(wrapperId) { // Custom select logic
                                const wrapperElem = document.getElementById(wrapperId);
                                const displayDiv = wrapperElem.querySelector('.custom-select-display');
                                displayDiv.classList.remove('border-red-500', 'bg-red-50', 'ring-2', 'ring-red-200');
                                displayDiv.classList.add('border-gray-300', 'bg-white');

                                if (!nilai || nilai === "") {
                                    isValid = false;
                                    emptyCount++;
                                    displayDiv.classList.remove('border-gray-300', 'bg-white');
                                    displayDiv.classList.add('border-red-500', 'bg-red-50', 'ring-2', 'ring-red-200');
                                } else {
                                    payload.push({
                                        alternatif_id: parseInt(select.dataset.altId),
                                        kriteria_id: parseInt(select.dataset.kritId),
                                        nilai: parseFloat(nilai),
                                    });
                                }
                            } else { // Fallback input number
                                if (!nilai || nilai === "") {
                                    isValid = false;
                                    emptyCount++;
                                    select.classList.add('border-red-500', 'bg-red-50');
                                } else {
                                    select.classList.remove('border-red-500', 'bg-red-50');
                                    payload.push({
                                        alternatif_id: parseInt(select.dataset.altId),
                                        kriteria_id: parseInt(select.dataset.kritId),
                                        nilai: parseFloat(nilai),
                                    });
                                }
                            }
                        });

                        if (!isValid) {
                            showToast(`Gagal! Ada ${emptyCount} kolom yang belum diisi.`, "error");
                            return;
                        }

                        btn.disabled = true;
                        const originalHtml = btn.innerHTML;
                        btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Menyimpan...`;

                        try {
                            // PENTING: Gunakan getApiUrl jika Superadmin perlu simpan atas nama filter_id (tergantung backend)
                            // Tapi biasanya backend penilaian/save-all menggunakan data dari payload
                            // Namun untuk amannya gunakan getApiUrl agar session konsisten
                            const res = await fetch(getApiUrl('/penilaian/save-all'), {
                                method: "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify(payload),
                            });
                            const result = await res.json();
                            if (!res.ok) throw new Error(result.message);
                            
                            showToast("Penilaian berhasil disimpan!", "success");
                        } catch (err) {
                            showToast(`Error: ${err.message}`, "error");
                        } finally {
                            btn.disabled = false;
                            btn.innerHTML = originalHtml;
                        }
                    });

                } catch (err) {
                    console.error("Error:", err);
                    loader.classList.add('hidden');
                    contentDiv.classList.remove('hidden');
                    contentDiv.innerHTML = `<div class="p-10 text-center text-red-500">Gagal memuat halaman.<br><small>${err.message}</small></div>`;
                }
                return;
            }

             // ======================
            // PERHITUNGAN SAW (UPDATED: SUPPORT SUPERADMIN FILTER & KOMENTAR LOGIKA)
            // ======================
            if (page === "perhitungan") {
                // 1. Set nama halaman aktif untuk fitur refresh
                currentPageName = "perhitungan";

                // 2. Render UI (Tampilan Awal)
                // Kita siapkan CSS khusus cetak dan struktur tab navigasi
                container.innerHTML = `
            <style>
                /* CSS KHUSUS CETAK (Agar rapi saat di-print) */
                @media print {
                    body * { visibility: hidden; }
                    #content-container, #content-container * { visibility: visible; }
                    #sidebar-wrapper, header, .no-print, button, nav, .tab-btn-container, #state-initial, #state-loading { display: none !important; }

                    @page { size: A4 landscape; margin: 1cm; }
                    body { background: white !important; color: black !important; font-family: 'Times New Roman', serif; font-size: 10pt; }
                    #content-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }

                    #print-header { display: block !important; text-align: center; margin-bottom: 20px; border-bottom: 3px double #000; padding-bottom: 10px; }
                    #print-header h1 { font-size: 14pt; font-weight: bold; margin: 0; text-transform: uppercase; }
                    #print-header h2 { font-size: 12pt; font-weight: bold; margin: 5px 0; }
                    #print-header p { font-size: 10pt; font-style: italic; margin: 0; }

                    h3.print-title { font-size: 11pt; font-weight: bold; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; color: #000 !important; page-break-after: avoid; }

                    table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; margin-bottom: 15px; page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    th, td { border: 1px solid #000 !important; padding: 5px 8px !important; color: #000 !important; font-size: 10pt; }
                    thead { display: table-header-group; }
                    thead th { background-color: #f2f2f2 !important; font-weight: bold; text-align: center; }
                    td { text-align: center; }
                    td:nth-child(2) { text-align: left !important; padding-left: 10px !important; }

                    .tab-pane { display: block !important; opacity: 1 !important; page-break-inside: auto !important; margin-bottom: 10px; }

                    #chart-section-print { display: block !important; page-break-inside: avoid; page-break-before: auto; margin-top: 20px; border: 1px solid #000; padding: 10px; height: 350px !important; width: 100% !important; }
                    body.hide-chart-on-print #chart-section-print { display: none !important; }
                    .bg-white, .dark\\:bg-gray-800 { box-shadow: none !important; border: none !important; background: none !important; }
                    .rank-badge { border: none !important; font-weight: normal !important; }
                }
            </style>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px] flex flex-col">
                
                <div id="print-header" class="hidden">
                    <h1>Laporan Hasil Keputusan (SPK)</h1>
                    <h2>Metode Simple Additive Weighting (SAW)</h2>
                    <p>Dicetak otomatis pada: ${new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
                </div>

                <div class="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800 dark:text-white">Proses Perhitungan SAW</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Analisis data alternatif berdasarkan kriteria.</p>
                    </div>
                    <button id="run-saw-btn" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition flex items-center gap-2">
                        <i class="bi bi-cpu-fill"></i> Mulai Hitung
                    </button>
                </div>

                <div class="tab-btn-container border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 no-print">
                    <nav class="-mb-px flex space-x-6 overflow-x-auto" id="calcTabs">
                        <button onclick="switchTab('tab-matriks')" class="tab-btn border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 font-medium py-4 px-1 text-sm whitespace-nowrap transition" data-target="tab-matriks">1. Matriks Awal (X)</button>
                        <button onclick="switchTab('tab-normalisasi')" class="tab-btn border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 font-medium py-4 px-1 text-sm whitespace-nowrap transition" data-target="tab-normalisasi">2. Normalisasi (R)</button>
                        <button onclick="switchTab('tab-bobot')" class="tab-btn border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 font-medium py-4 px-1 text-sm whitespace-nowrap transition" data-target="tab-bobot">3. Terbobot (W)</button>
                        <button onclick="switchTab('tab-ranking')" class="tab-btn active-tab border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold py-4 px-1 text-sm whitespace-nowrap transition" data-target="tab-ranking"><i class="bi bi-trophy-fill mr-1"></i> Hasil Perankingan</button>
                    </nav>
                </div>

                <div id="calcContent" class="p-6 flex-1 bg-gray-50/30 dark:bg-gray-900/20 relative">
                    
                    <div id="state-initial" class="flex flex-col items-center justify-center h-64 text-center text-gray-400 no-print">
                        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3"><i class="bi bi-bar-chart-steps text-3xl"></i></div>
                        <p class="font-medium">Data belum diproses. Klik "Mulai Hitung".</p>
                    </div>

                    <div id="state-loading" class="hidden flex flex-col items-center justify-center h-64 text-center text-indigo-500 no-print">
                        <span class="spinner-border w-8 h-8 mb-3"></span>
                        <p class="font-bold animate-pulse">Sedang melakukan kalkulasi...</p>
                    </div>

                    <div id="state-result" class="hidden space-y-8">
                        
                        <div id="tab-matriks" class="tab-pane hidden">
                            <h3 class="print-title hidden print:block">1. Matriks Keputusan (X)</h3>
                            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div class="p-4 border-b bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm font-medium no-print"><i class="bi bi-table mr-2"></i> Matriks Keputusan</div>
                                <div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" id="table-matriks"></table></div>
                            </div>
                        </div>

                        <div id="tab-normalisasi" class="tab-pane hidden">
                            <h3 class="print-title hidden print:block">2. Matriks Normalisasi (R)</h3>
                            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div class="p-4 border-b bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-sm font-medium no-print"><i class="bi bi-calculator mr-2"></i> Normalisasi</div>
                                <div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" id="table-norm"></table></div>
                            </div>
                        </div>

                        <div id="tab-bobot" class="tab-pane hidden">
                            <h3 class="print-title hidden print:block">3. Matriks Terbobot (W*R)</h3>
                            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div class="p-4 border-b bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-sm font-medium no-print"><i class="bi bi-layers-half mr-2"></i> Terbobot</div>
                                <div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" id="table-weight"></table></div>
                            </div>
                        </div>

                        <div id="tab-ranking" class="tab-pane block">
                            <h3 class="print-title hidden print:block">Tabel Peringkat Akhir</h3>
                            
                            <div id="juara-kriteria-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print">
                                </div>

                            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
                                <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 font-bold text-gray-700 dark:text-gray-300 text-sm no-print flex justify-between items-center">
                                    <span>Tabel Peringkat</span>
                                    <i class="bi bi-trophy text-yellow-500"></i>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" id="table-ranking"></table>
                                </div>
                            </div>

                            <div id="chart-section-print" class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 class="print-title hidden print:block text-center mb-4">Grafik Nilai Preferensi</h3>
                                <h4 class="font-bold text-lg mb-4 text-gray-800 dark:text-white flex items-center gap-2 no-print">
                                    <i class="bi bi-graph-up-arrow text-indigo-600"></i> Grafik Nilai Terbobot
                                </h4>
                                <div style="height: 350px; position: relative; width: 100%;">
                                    <canvas id="miniChart"></canvas>
                                </div>
                            </div>

                            <div class="mt-6 flex justify-end gap-3 no-print">
                                <button onclick="printReport(false)" class="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-lg font-semibold transition flex items-center gap-2"><i class="bi bi-table"></i> Cetak Tabel Saja</button>
                                <button onclick="printReport(true)" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition flex items-center gap-2"><i class="bi bi-bar-chart-line-fill"></i> Cetak Lengkap (+Grafik)</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="modal-detail-analisis" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in no-print">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div class="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-indigo-600">
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <i class="bi bi-search"></i> Analisis Mendalam: <span id="modal-detail-title" class="underline decoration-wavy"></span>
                        </h3>
                        <button onclick="document.getElementById('modal-detail-analisis').classList.add('hidden')" class="text-white/80 hover:text-white text-2xl transition">&times;</button>
                    </div>
                    <div class="p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-[350px] relative">
                                <canvas id="radarChartCanvas"></canvas>
                            </div>
                            <div class="space-y-4">
                                <h4 class="font-bold text-gray-800 dark:text-white border-b pb-2">Kekuatan & Kelemahan</h4>
                                <ul id="modal-detail-list" class="space-y-2 text-sm text-gray-600 dark:text-gray-300 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

                // 3. Helper Functions (Cetak & Switch Tab)
                window.printReport = (withChart) => {
                    const body = document.body;
                    if (withChart) { body.classList.remove('hide-chart-on-print'); } else { body.classList.add('hide-chart-on-print'); }
                    if (myWeightedChart) myWeightedChart.resize();
                    setTimeout(() => window.print(), 300);
                };

                window.switchTab = (targetId) => {
                    document.querySelectorAll('.tab-btn').forEach(btn => {
                        const isActive = btn.dataset.target === targetId;
                        // Ubah style tombol aktif
                        btn.classList.toggle('border-indigo-500', isActive);
                        btn.classList.toggle('text-indigo-600', isActive);
                        btn.classList.toggle('dark:text-indigo-400', isActive);
                        btn.classList.toggle('border-transparent', !isActive);
                        btn.classList.toggle('text-gray-500', !isActive);
                    });
                    // Sembunyikan semua tab content, tampilkan target
                    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
                    document.getElementById(targetId).classList.remove('hidden');
                };

                // 4. Logika Render "Kartu Juara" (Insight Data)
                window.renderBestCriteriaCards = (data) => {
                    const container = document.getElementById('juara-kriteria-container');
                    if (!container) return;
                    container.innerHTML = '';

                    const kriteria = data.kriteriaData;
                    const values = data.initialValues;

                    kriteria.forEach(k => {
                        let bestAlt = null;
                        // Benefit: Cari Max, Cost: Cari Min
                        let bestVal = (k.tipe.toLowerCase() === 'benefit') ? -Infinity : Infinity;

                        values.forEach(row => {
                            const val = parseFloat(row[k.kode]);
                            if (k.tipe.toLowerCase() === 'benefit') {
                                if (val > bestVal) { bestVal = val; bestAlt = row.alternatif_nama; }
                            } else {
                                if (val < bestVal) { bestVal = val; bestAlt = row.alternatif_nama; }
                            }
                        });

                        const borderClass = k.tipe.toLowerCase() === 'benefit' ? 'border-green-500' : 'border-orange-500';
                        const icon = k.tipe.toLowerCase() === 'benefit' ? 'bi-graph-up-arrow text-green-500' : 'bi-graph-down-arrow text-orange-500';

                        container.innerHTML += `
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 ${borderClass} relative overflow-hidden group hover:shadow-md transition">
                        <div class="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition">
                            <i class="bi ${icon} text-4xl"></i>
                        </div>
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">${k.nama}</p>
                        <h4 class="text-lg font-bold text-gray-800 dark:text-white truncate" title="${bestAlt}">${bestAlt}</h4>
                        <div class="flex justify-between items-end mt-2">
                            <span class="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono">Nilai: ${bestVal}</span>
                            <span class="text-[10px] text-${k.tipe === 'Benefit' ? 'green' : 'orange'}-500 font-bold border border-${k.tipe === 'Benefit' ? 'green' : 'orange'}-200 px-1 rounded">${k.tipe}</span>
                        </div>
                    </div>
                `;
                    });
                };

                // 5. Logika Buka Modal Detail (Radar Chart)
                window.openDetailAnalysis = (altId) => {
                    if (!globalCalculationData) {
                        showToast("Data perhitungan tidak ditemukan. Silakan hitung ulang.", "error");
                        return;
                    }

                    // Ambil data spesifik alternatif ini
                    const altName = globalCalculationData.ranking.find(r => r.alternatif_id == altId).alternatif_nama;
                    const normRow = globalCalculationData.normalizedValues.find(r => r.alternatif_id == altId);
                    const initRow = globalCalculationData.initialValues.find(r => r.alternatif_id == altId);
                    const kriteria = globalCalculationData.kriteriaData;

                    document.getElementById('modal-detail-title').innerText = altName;
                    document.getElementById('modal-detail-analisis').classList.remove('hidden');
                    document.getElementById('modal-detail-analisis').classList.add('flex');

                    const listContainer = document.getElementById('modal-detail-list');
                    listContainer.innerHTML = '';

                    // Generate List Kekuatan/Kelemahan
                    kriteria.forEach(k => {
                        const nVal = normRow[k.kode]; // Nilai Normalisasi (0 - 1)
                        const origVal = initRow[k.kode]; // Nilai Asli

                        // Tentukan status berdasarkan skor normalisasi
                        let status, color;
                        if (nVal >= 0.8) { status = "Sangat Unggul"; color = "text-green-600 bg-green-50 border-green-200"; }
                        else if (nVal >= 0.6) { status = "Baik"; color = "text-blue-600 bg-blue-50 border-blue-200"; }
                        else if (nVal >= 0.4) { status = "Cukup"; color = "text-yellow-600 bg-yellow-50 border-yellow-200"; }
                        else { status = "Lemah"; color = "text-red-600 bg-red-50 border-red-200"; }

                        listContainer.innerHTML += `
                    <li class="flex items-center justify-between p-3 rounded-lg border ${color} dark:bg-gray-800 dark:border-gray-600">
                        <div>
                            <span class="block text-xs font-bold text-gray-500 uppercase">${k.nama}</span>
                            <span class="font-bold text-gray-800 dark:text-gray-200">Nilai: ${origVal}</span>
                        </div>
                        <div class="text-right">
                            <span class="block text-xs font-bold ${color.split(' ')[0]}">${status}</span>
                            <div class="w-20 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                <div class="h-full bg-current opacity-70" style="width: ${nVal * 100}%"></div>
                            </div>
                        </div>
                    </li>
                `;
                    });

                    // Gambar Radar Chart dengan Chart.js
                    const ctx = document.getElementById('radarChartCanvas').getContext('2d');
                    if (myRadarChart) myRadarChart.destroy(); // Hapus chart lama agar tidak numpuk

                    const labels = kriteria.map(k => k.nama);
                    const dataValues = kriteria.map(k => normRow[k.kode]);

                    myRadarChart = new Chart(ctx, {
                        type: 'radar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Performa (Normalisasi 0-1)',
                                data: dataValues,
                                fill: true,
                                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                borderColor: 'rgb(99, 102, 241)',
                                pointBackgroundColor: 'rgb(99, 102, 241)',
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: 'rgb(99, 102, 241)'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                r: {
                                    angleLines: { color: 'rgba(0,0,0,0.1)' },
                                    grid: { color: 'rgba(0,0,0,0.1)' },
                                    pointLabels: {
                                        font: { size: 11, weight: 'bold' },
                                        color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#4b5563'
                                    },
                                    suggestedMin: 0,
                                    suggestedMax: 1
                                }
                            },
                            plugins: { legend: { display: false } }
                        }
                    });
                };

                // 6. EVENT LISTENER: TOMBOL MULAI HITUNG (FIXED VARIABLE NAME)
                const btnRun = document.getElementById("run-saw-btn");
                btnRun.addEventListener("click", async () => {
                    
                    // --- VALIDASI STRICT SUPERADMIN ---
                    if (user.role === 'superadmin' && !selectedFilterId) {
                        showToast("Mohon pilih Admin Target terlebih dahulu di menu atas!", "error");
                        return;
                    }

                    // Tampilkan Loading
                    document.getElementById("state-initial").classList.add("hidden");
                    document.getElementById("state-result").classList.add("hidden");
                    document.getElementById("state-loading").classList.remove("hidden");
                    
                    btnRun.disabled = true;
                    btnRun.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Memproses...`;

                    try {
                        // 1. Request ke Backend
                        const res = await fetch(getApiUrl('/perhitungan/hitung'), { 
                            method: "POST", 
                            headers: { Authorization: `Bearer ${token}` } 
                        });
                        
                        // 2. Ambil JSON (Simpan di variabel bernama 'result')
                        const result = await res.json(); 
                        
                        // 3. Cek Status HTTP
                        if (!res.ok) throw new Error(result.message || "Gagal menghitung.");

                        // 4. Ambil Data Inti (Cek apakah dibungkus 'data' atau tidak)
                        //    Backend Anda mengirim: { success: true, data: { ... } }
                        const dataPerhitungan = result.data || result;

                        // 5. Validasi Struktur Data sebelum Render (Mencegah error 'map')
                        if (!dataPerhitungan.kriteriaData || !Array.isArray(dataPerhitungan.kriteriaData)) {
                             throw new Error("Data hasil perhitungan kosong atau format salah.");
                        }

                        // 6. Render Tabel
                        renderAllTables(dataPerhitungan); 

                        // 7. Tampilkan Hasil
                        document.getElementById("state-loading").classList.add("hidden");
                        document.getElementById("state-result").classList.remove("hidden");
                        switchTab('tab-ranking'); 
                        showToast("Perhitungan Selesai!", "success");

                    } catch (err) {
                        console.error(err);
                        showToast(err.message, "error");
                        
                        // Reset tampilan ke awal jika error
                        document.getElementById("state-loading").classList.add("hidden");
                        document.getElementById("state-initial").classList.remove("hidden");
                    } finally {
                        btnRun.disabled = false;
                        btnRun.innerHTML = `<i class="bi bi-cpu-fill"></i> Mulai Hitung`;
                    }
                });

                // 7. FUNGSI RENDER SEMUA TABEL
                function renderAllTables(data) {
                    // Simpan data ke variabel global agar bisa dipakai di Modal Detail
                    globalCalculationData = data;

                    const { kriteriaData, initialValues, normalizedValues, weightedNormalizedValues, ranking } = data;
                    
                    // Buat Header Tabel (Dinamis sesuai kriteria)
                    const headers = kriteriaData.map(k => `<th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-700 dark:text-gray-300">${k.nama} (${k.kode})</th>`).join('');
                    const commonHeader = `<thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-10">No</th><th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-48">Alternatif</th>${headers}</tr></thead>`;

                    // Helper untuk membuat baris tabel
                    const createRows = (dataset, isRanking = false) => dataset.map((row, i) => {
                        let cells = kriteriaData.map(k => `<td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">${(row[k.kode] || 0).toFixed(3)}</td>`).join('');
                        return `<tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"><td class="px-4 py-3 text-center text-sm text-gray-500">${isRanking ? row.rank : i + 1}</td><td class="px-4 py-3 text-sm font-bold text-gray-800 dark:text-white">${row.alternatif_nama}</td>${cells}</tr>`;
                    }).join('');

                    // Isi Tabel 1, 2, 3
                    document.getElementById('table-matriks').innerHTML = commonHeader + `<tbody>${createRows(initialValues)}</tbody>`;
                    document.getElementById('table-norm').innerHTML = commonHeader + `<tbody>${createRows(normalizedValues)}</tbody>`;
                    document.getElementById('table-weight').innerHTML = commonHeader + `<tbody>${createRows(weightedNormalizedValues)}</tbody>`;

                    // Isi Tabel Ranking (Spesial: Ada Tombol Detail)
                    const rankingRows = ranking.map(r => `
                        <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 ${r.rank === 1 ? 'bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500' : ''}">
                            <td class="px-6 py-4 text-center"><span class="rank-badge w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${r.rank <= 3 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}">${r.rank}</span></td>
                            <td class="px-6 py-4 font-bold text-gray-800 dark:text-white">
                                ${r.alternatif_nama}
                                ${r.rank === 1 ? '<i class="bi bi-star-fill text-yellow-400 ml-2"></i>' : ''}
                            </td>
                            <td class="px-6 py-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 text-lg">${r.nilai.toFixed(4)}</td>
                            
                            <td class="px-6 py-4 text-right no-print">
                                <button onclick="openDetailAnalysis(${r.alternatif_id})" class="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-full font-bold transition flex items-center justify-end gap-1 ml-auto">
                                    <i class="bi bi-search"></i> Analisa
                                </button>
                            </td>
                        </tr>
                    `).join('');

                    document.getElementById('table-ranking').innerHTML = `<thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-6 py-3 text-center w-20">Rank</th><th class="px-6 py-3 text-left">Alternatif</th><th class="px-6 py-3 text-right">Total Skor (V)</th><th class="px-6 py-3 text-right no-print">Detail</th></tr></thead><tbody>${rankingRows}</tbody>`;

                    renderMiniChart(data);
                    renderBestCriteriaCards(data);
                }

                // 8. Logika Render Grafik Garis (Mini Chart)
                function renderMiniChart(fullData) {
                    const ctx = document.getElementById('miniChart');
                    if (myWeightedChart) myWeightedChart.destroy();
                    
                    const { kriteriaData, weightedNormalizedValues } = fullData;
                    const labels = kriteriaData.map(k => k.nama);
                    
                    const datasets = weightedNormalizedValues.map((alt, index) => {
                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
                        const color = colors[index % colors.length];
                        return {
                            label: alt.alternatif_nama,
                            data: kriteriaData.map(k => alt[k.kode]),
                            borderColor: color,
                            backgroundColor: color + '33',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            borderWidth: 2
                        };
                    });

                    myWeightedChart = new Chart(ctx, {
                        type: 'line',
                        data: { labels: labels, datasets: datasets },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: { mode: 'index', intersect: false },
                            plugins: { 
                                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }, 
                                tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, cornerRadius: 6 } 
                            },
                            scales: { 
                                y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, 
                                x: { grid: { display: false } } 
                            }
                        }
                    });
                }
                return;
            }

    // ======================
    // BACKUP DATABASE (DENGAN PROTEKSI PASSWORD DI AWAL)
    // ======================
    if (page === "backup-db") {
        if (user.role !== "superadmin") return;

        // 1. TAMPILKAN STATE TERKUNCI
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-[500px] text-gray-400 animate-pulse">
                <i class="bi bi-database-lock text-6xl mb-4"></i>
                <p class="text-lg font-semibold">Menunggu Verifikasi Keamanan...</p>
            </div>
        `;

        // 2. PANGGIL GATEKEEPER
        promptAccessVerification(async () => {
            // --- KODE ASLI BACKUP DIMASUKKAN KE SINI ---
            container.innerHTML = `
                <div class="flex justify-between items-center mb-4 animate-fade-in">
                    <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Backup Data</h2>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                     <p class="text-gray-700 dark:text-gray-300 mb-4">Mode Aman Aktif. Silakan kelola backup database.</p>
                     <button id="btn-create-backup" class="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 font-semibold transition flex items-center justify-center">
                        <i class="bi bi-plus-lg mr-2"></i> Buat Backup Baru
                    </button>
                </div>
                <div id="backupTableContainer" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full"><tbody id="backup-table-body"></tbody></table>
                    </div>
                </div>
            `;

            await loadBackupTable();

            document.getElementById("btn-create-backup").addEventListener("click", async (e) => {
                // Di sini TIDAK PERLU minta password lagi karena sudah diverifikasi di awal masuk halaman
                // Langsung eksekusi backup
                const btn = e.currentTarget;
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span> Memproses...';
                try {
                    const res = await fetch(`${API_BASE_URL}/backup/database`, { 
                        method: 'POST', 
                        headers: { Authorization: `Bearer ${token}` } // Tidak perlu header password lagi jika endpoint backup biasa
                    });
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.message);
                    showToast(result.message || 'Backup berhasil dibuat!');
                    await loadBackupTable();
                } catch (err) {
                    showToast(`Error: ${err.message}`, 'error');
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="bi bi-plus-lg mr-2"></i> Buat Backup Baru';
                }
            });
        });
        return;
    }

    // ============================================================
    // 1. MANAJEMEN ADMIN (LENGKAP DENGAN GATEKEEPER & CRUD)
    // ============================================================
    if (page === "manajemen-admin") {
        if (user.role !== "superadmin") {
            container.innerHTML = `<div class="flex flex-col items-center justify-center h-64 text-red-500"><i class="bi bi-shield-lock-fill text-5xl mb-3"></i><p class="font-bold text-lg">Akses Ditolak</p></div>`;
            return;
        }

        // Tampilkan State Terkunci
        container.innerHTML = `<div class="flex flex-col items-center justify-center h-[500px] text-gray-400 animate-pulse"><i class="bi bi-lock-fill text-6xl mb-4"></i><p class="text-lg font-semibold">Menunggu Verifikasi Keamanan...</p></div>`;

        // PANGGIL GATEKEEPER (Password Verifikasi di Awal)
        promptAccessVerification(async () => {
            container.innerHTML = `
                <div class="flex justify-between items-center mb-6 animate-fade-in">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Admin</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Mode Aman Aktif <i class="bi bi-shield-check text-green-500"></i></p>
                    </div>
                    <button id="btnAddAdmin" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-lg font-bold transition flex items-center gap-2">
                        <i class="bi bi-person-plus-fill text-lg"></i> Tambah Admin
                    </button>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div id="adminTableContainer" class="overflow-x-auto"></div>
                </div>
            `;

            // --- FUNGSI INTERNAL: LOAD TABEL ---
            const loadTable = async () => {
                const tableDiv = document.getElementById("adminTableContainer");
                try {
                    const res = await fetch(`${API_BASE_URL}/admin`, { headers: { Authorization: `Bearer ${token}` } });
                    const admins = await res.json();
                    const rows = admins.map((a, i) => {
                        const isSuper = a.role === 'superadmin';
                        return `
                            <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td class="px-6 py-4 text-center text-sm font-mono">${i + 1}</td>
                                <td class="px-6 py-4 font-bold text-gray-800 dark:text-white">${a.username}</td>
                                <td class="px-6 py-4">
                                    <span class="px-3 py-1 rounded-full text-xs font-bold ${isSuper ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                                        ${isSuper ? 'SUPER ADMIN' : 'ADMIN STAFF'}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    ${isSuper 
                                        ? `<button onclick='showEditSuperAdminModal("${a.username}")' class="px-3 py-1.5 bg-yellow-500 text-white text-xs font-bold rounded-lg shadow-sm">Update Akun</button>`
                                        : `<div class="flex justify-end gap-2">
                                            <button onclick='showEditStaffModal(${JSON.stringify(a)})' class="bg-blue-100 text-blue-600 p-2 rounded-lg"><i class="bi bi-pencil-fill"></i></button>
                                            <button onclick='deleteAdminClient(${a.id}, "${a.username}")' class="bg-red-100 text-red-600 p-2 rounded-lg"><i class="bi bi-trash-fill"></i></button>
                                           </div>`
                                    }
                                </td>
                            </tr>`;
                    }).join("");
                    tableDiv.innerHTML = `<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="px-6 py-3">No</th><th class="px-6 py-3 text-left">Username</th><th class="px-6 py-3 text-left">Role</th><th class="px-6 py-3 text-right">Aksi</th></tr></thead><tbody class="bg-white dark:bg-gray-800">${rows}</tbody></table>`;
                } catch (e) { tableDiv.innerHTML = `<p class="p-4 text-red-500 text-center">Gagal memuat data.</p>`; }
            };

            await loadTable();

            // --- FUNGSI MODAL: TAMBAH ADMIN ---
            window.showAddAdminModal = async () => {
                const result = await showPrompt({
                    title: "Tambah Staff Admin",
                    fields: [
                        { id: "username", label: "Username Baru", required: true, placeholder: "Contoh: admin_gudang" },
                        { id: "password", label: "Password Awal", type: "password", required: true, placeholder: "Buat password..." }
                    ]
                });
                if (!result) return;
                try {
                    const res = await fetch(`${API_BASE_URL}/admin`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ ...result, role: 'admin' }),
                    });
                    if (!res.ok) throw new Error((await res.json()).message);
                    showToast("Admin ditambahkan", "success"); loadTable();
                } catch (err) { showToast(err.message, "error"); }
            };

            // --- FUNGSI MODAL: EDIT STAFF (TANPA PASSWORD LAMA) ---
            window.showEditStaffModal = (staff) => {
                const modal = document.getElementById("modal-container");
                modal.classList.remove("hidden"); modal.classList.add("flex");
                modal.innerHTML = `
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md m-auto overflow-hidden">
                        <form id="staffEditForm">
                            <div class="p-5 border-b font-bold dark:text-white bg-blue-50 dark:bg-blue-900/20">Edit Admin Staff</div>
                            <div class="p-6 space-y-4">
                                <input type="hidden" id="st_id" value="${staff.id}">
                                <div><label class="block text-sm font-bold mb-1">Username</label><input type="text" id="st_username" value="${staff.username}" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white" required></div>
                                <div><label class="block text-sm font-bold mb-1">Reset Password (Opsional)</label><input type="password" id="st_password" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white" placeholder="Isi untuk ganti"></div>
                            </div>
                            <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t flex justify-end gap-2">
                                <button type="button" onclick="document.getElementById('modal-container').classList.add('hidden')" class="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Simpan</button>
                            </div>
                        </form>
                    </div>`;
                document.getElementById("staffEditForm").onsubmit = async (e) => {
                    e.preventDefault();
                    const payload = { username: document.getElementById("st_username").value, role: 'admin' };
                    const pass = document.getElementById("st_password").value;
                    if(pass) payload.password = pass;
                    try {
                        const res = await fetch(`${API_BASE_URL}/admin/${document.getElementById("st_id").value}`, { 
                            method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload)
                        });
                        if(!res.ok) throw new Error((await res.json()).message);
                        showToast("Berhasil update"); modal.classList.add("hidden"); loadTable();
                    } catch (err) { showToast(err.message, "error"); }
                };
            };

            // --- FUNGSI MODAL: EDIT SUPER ADMIN (WAJIB PASSWORD LAMA) ---
            window.showEditSuperAdminModal = (currentUsername) => {
                const modal = document.getElementById("modal-container");
                modal.classList.remove("hidden"); modal.classList.add("flex");
                modal.innerHTML = `
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md m-auto overflow-hidden">
                        <form id="superEditForm">
                            <div class="p-5 border-b font-bold dark:text-white bg-yellow-50 dark:bg-yellow-900/20">Update Super Admin</div>
                            <div class="p-6 space-y-4">
                                <div><label class="block text-sm font-bold mb-1">Username</label><input type="text" id="sa_username" value="${currentUsername}" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white" required></div>
                                <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <label class="block text-sm font-bold text-red-600 mb-1">Password Lama (Wajib)</label>
                                    <input type="password" id="sa_oldPass" class="w-full border border-red-200 rounded-lg p-2 dark:bg-gray-700" required>
                                </div>
                                <div><label class="block text-sm font-bold mb-1">Password Baru</label><input type="password" id="sa_newPass" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white" placeholder="Kosongkan jika tidak diganti"></div>
                            </div>
                            <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t flex justify-end gap-2">
                                <button type="button" onclick="document.getElementById('modal-container').classList.add('hidden')" class="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                                <button type="submit" class="px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold">Update & Relogin</button>
                            </div>
                        </form>
                    </div>`;
                document.getElementById("superEditForm").onsubmit = async (e) => {
                    e.preventDefault();
                    try {
                        const res = await fetch(`${API_BASE_URL}/auth/profile`, { 
                            method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ 
                                username: document.getElementById("sa_username").value, 
                                oldPassword: document.getElementById("sa_oldPass").value, 
                                newPassword: document.getElementById("sa_newPass").value 
                            })
                        });
                        if(!res.ok) throw new Error((await res.json()).message);
                        showToast("Berhasil! Silakan Login Ulang");
                        setTimeout(() => { localStorage.clear(); window.location.replace("login.html"); }, 1500);
                    } catch (err) { showToast(err.message, "error"); }
                };
            };

            // --- FUNGSI HAPUS ADMIN ---
            window.deleteAdminClient = async (id, username) => {
                if (await showConfirm("Hapus Admin?", `Hapus akun <b>${username}</b>?`)) {
                    try {
                        const res = await fetch(`${API_BASE_URL}/admin/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                        if(!res.ok) throw new Error("Gagal hapus");
                        showToast("Admin dihapus"); loadTable();
                    } catch(err) { showToast(err.message, "error"); }
                }
            };

            document.getElementById("btnAddAdmin").onclick = () => showAddAdminModal();
        });
        return;
    }

    // ======================
    // HALAMAN CHATBOT (Final: Tombol Kirim ala WhatsApp/Gemini)
    // ======================
    else if (page === "chatbot") {

        if (mainHeader) {
            mainHeader.classList.add('shadow-md');
            mainHeader.classList.add('bg-white');
            mainHeader.classList.add('dark:bg-gray-800');
            mainHeader.style.borderBottom = ""; 
            mainHeader.style.backgroundColor = ""; 
        }

        container.innerHTML = `
        <style>
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            /* Styling List & Paragraf di dalam Chat */
    .markdown-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
    .markdown-body ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
    .markdown-body p { margin-bottom: 0.5em; }
    .markdown-body strong { font-weight: 700; color: inherit; }
    
    /* Styling Code Block (Agar tidak merah aneh) */
    .markdown-body pre { 
        background: #1f2937; 
        color: #e5e7eb; 
        padding: 10px; 
        border-radius: 8px; 
        overflow-x: auto; 
        font-family: monospace;
        margin: 10px 0;
    }
    .markdown-body code {
        background: rgba(0,0,0,0.1);
        padding: 2px 4px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.9em;
        color: #d946ef; /* Warna pink/ungu untuk inline code */
    }
    /* Di mode dark, code inline warnanya beda */
    .dark .markdown-body code {
        background: rgba(255,255,255,0.1);
        color: #f0abfc;
    }
        </style>

        <div class="flex flex-col h-[calc(100vh-85px)] w-full relative bg-transparent">
            
            <div class="flex-none w-full py-2 relative flex items-center justify-center">
                <span class="text-gray-400 text-xs font-medium uppercase tracking-widest">
                    Asisten SPK SAW
                </span>

                <div class="absolute right-4 top-0 z-20">
                    <button id="chat-settings-btn" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition focus:outline-none">
                        <i class="bi bi-gear-fill text-lg"></i>
                    </button>
                    
                    <div id="chat-settings-menu" class="hidden absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-200 origin-top-right z-50">
                        <div class="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50 dark:bg-gray-900 tracking-wider">TAMPILAN</div>
                        <button onclick="document.getElementById('user-avatar-input').click()" class="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors">
                            <i class="bi bi-person-circle text-indigo-500 text-lg"></i> Ganti Foto Saya
                        </button>
                        <button onclick="document.getElementById('bot-avatar-input').click()" class="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-gray-700">
                            <i class="bi bi-robot text-teal-500 text-lg"></i> Ganti Ikon Bot
                        </button>
                        <button id="btn-reset-profile" class="w-full text-left px-4 py-3 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-gray-700">
                            <i class="bi bi-arrow-counterclockwise text-lg"></i> Reset Tampilan Default
                        </button>
                        <div class="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50 dark:bg-gray-900 tracking-wider">DATA</div>
                        <button id="btn-clear-chat" class="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3 transition-colors">
                            <i class="bi bi-trash3-fill text-lg"></i> Hapus Riwayat Chat
                        </button>
                    </div>
                </div>
            </div>

            <input type="file" id="user-avatar-input" accept="image/*" class="hidden">
            <input type="file" id="bot-avatar-input" accept="image/*" class="hidden">

            <div id="chat-messages" class="flex-1 overflow-y-auto w-full p-4 scroll-smooth no-scrollbar">
                <div id="empty-state" class="flex flex-col items-center justify-center h-full text-center opacity-100 transition-opacity duration-500">
                    <div class="p-4 mb-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                        <i class="bi bi-stars text-4xl text-indigo-500"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">Apa yang bisa saya bantu?</h2>
                    <p class="text-gray-500 dark:text-gray-400 max-w-md">
                        Tanyakan tentang perhitungan SAW, data alternatif, atau analisis kriteria.
                    </p>
                </div>
            </div>

            <div class="flex-none w-full pt-4 pb-6 px-4 bg-gradient-to-t from-gray-100 via-gray-100/80 to-transparent dark:from-gray-900 dark:to-transparent">
                <div class="max-w-4xl mx-auto w-full relative">
                    <form id="chat-form" class="relative shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                        <input 
                            id="chat-input" 
                            type="text" 
                            autocomplete="off" 
                            placeholder="Kirim pesan ke Asisten SPK..." 
                            class="w-full py-4 pl-5 pr-14 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 outline-none border-none"
                        >
                        <button 
                            type="submit" 
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all flex items-center justify-center disabled:opacity-50 shadow-md"
                            id="send-btn"
                        >
                            <i class="bi bi-send-fill text-lg ml-0.5"></i>
                        </button>
                    </form>
                    <div class="text-center mt-2">
                        <p class="text-[10px] text-gray-400 dark:text-gray-500">
                            AI dapat membuat kesalahan. Periksa hasil penting.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        `;

        // === LOGIC (History, Settings, Upload, Reset, Clear) ===
        const savedHistory = getChatHistory();
        if (savedHistory.length > 0) {
            const emptyState = document.getElementById('empty-state');
            if(emptyState) emptyState.style.display = 'none';
            savedHistory.forEach(item => { addMessageToChat(item.text, item.sender); });
            setTimeout(() => {
                const msgContainer = document.getElementById('chat-messages');
                if(msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
            }, 50);
        }

        const settingsBtn = document.getElementById('chat-settings-btn');
        const settingsMenu = document.getElementById('chat-settings-menu');
        settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); settingsMenu.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) { settingsMenu.classList.add('hidden'); }});

        const handleImageUpload = (inputId, configKey) => {
            const fileInput = document.getElementById(inputId);
            fileInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        saveChatConfig({ [configKey]: e.target.result });
                        settingsMenu.classList.add('hidden');
                        showToast("Foto profil diperbarui!", "success");
                        loadContent('chatbot');
                    };
                    reader.readAsDataURL(file);
                }
            });
        };
        handleImageUpload('user-avatar-input', 'userAvatar');
        handleImageUpload('bot-avatar-input', 'botAvatar');

        document.getElementById('btn-reset-profile').addEventListener('click', async () => {
            if (await showConfirm("Reset Tampilan", "Kembalikan ke bawaan?")) {
                localStorage.removeItem(`chat_config_${user.username}`);
                loadContent('chatbot');
                showToast("Tampilan default dipulihkan.", "success");
            }
        });

        document.getElementById('btn-clear-chat').addEventListener('click', async () => {
            if (await showConfirm("Hapus Riwayat", "Hapus semua chat?")) {
                localStorage.removeItem(`chat_history_${user.username}`);
                loadContent('chatbot');
                showToast("Riwayat dihapus.", "success");
            }
        });

        document.getElementById('chat-form').addEventListener('submit', handleChatSubmit);
        setTimeout(() => document.getElementById('chat-input').focus(), 100);
        return;
    }

    // Default
    container.innerHTML = `<p class="text-gray-500 dark:text-gray-400">Halaman tidak ditemukan.</p>`;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-red-500">Gagal memuat konten.</p>`;
  }
};

// ===============================================
// === FUNGSI MODAL & ALERT BARU (CANTIK) ===
// ===============================================

// ============================
// FUNGSI TOAST NOTIFICATION (Pengganti Alert)
// ============================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const icon = isSuccess ? `<i class="bi bi-check-circle-fill"></i>` : `<i class="bi bi-exclamation-triangle-fill"></i>`;
  const toast = document.createElement('div');
  toast.className = `flex items-center w-full max-w-xs p-4 text-white ${bgColor} rounded-lg shadow-lg transform transition-all translate-x-full opacity-0 duration-300 ease-out`;
  toast.innerHTML = `
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">${icon}</div>
        <div class="ml-3 text-sm font-medium">${message}</div>
        <button type="button" class="ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg hover:bg-white hover:bg-opacity-20" aria-label="Close">&times;</button>
    `;
  container.prepend(toast);
  setTimeout(() => { toast.classList.remove('translate-x-full'); toast.classList.remove('opacity-0'); }, 10);
  const removeToast = () => {
    toast.classList.add('opacity-0'); toast.classList.add('scale-90');
    setTimeout(() => { toast.remove(); }, 300);
  };
  const timer = setTimeout(removeToast, 3000);
  toast.querySelector('button').addEventListener('click', () => {
    clearTimeout(timer);
    removeToast();
  });
}

// ============================
// FUNGSI CONFIRM MODAL (Pengganti Confirm)
// ============================
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modal-container");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm m-auto transform transition-all duration-300 scale-100">
            <div class="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center">
                    <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100 sm:h-8 sm:w-8">
                        <i class="bi bi-exclamation-triangle-fill text-red-600"></i>
                    </div>
                    <h3 class="ml-3 text-lg font-semibold text-gray-800 dark:text-white">${title}</h3>
                </div>
                <button class="btn-cancel text-gray-400 hover:text-gray-600 dark:hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <div class="p-6"><p class="text-sm text-gray-600 dark:text-gray-300">${message}</p></div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button class="btn-cancel px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition">Batal</button>
                <button class="btn-confirm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-semibold">Ya, Hapus</button>
            </div>
        </div>
      `;
    const close = () => { modal.classList.add("hidden"); modal.innerHTML = ""; };
    modal.querySelector(".btn-confirm").onclick = () => { close(); resolve(true); };
    modal.querySelectorAll(".btn-cancel").forEach(btn => {
      btn.onclick = () => { close(); resolve(false); };
    });
  });
}

// ============================
// FUNGSI PROMPT MODAL (Pengganti Prompt)
// ============================
function showPrompt({ title, fields }) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modal-container");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    const fieldsHTML = fields.map(field => {
      if (field.type === 'select') {
        const optionsHTML = (field.options || []).map(opt =>
          `<option value="${opt.value}" ${opt.value === field.value ? 'selected' : ''}>${opt.label}</option>`
        ).join('');
        return `
          <div>
              <label for="${field.id}" class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.label}</label>
              <select 
                  id="${field.id}" 
                  class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" 
                  ${field.required ? 'required' : ''}
              >
                  ${optionsHTML}
              </select>
          </div>
        `;
      }
      return `
        <div>
            <label for="${field.id}" class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.label}</label>
            <input 
                type="${field.type || 'text'}" 
                id="${field.id}" 
                value="${field.value || ''}" 
                placeholder="${field.placeholder || ''}"
                class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" 
                ${field.required ? 'required' : ''}
            >
        </div>
      `;
    }).join('');
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-auto transform transition-all duration-300 scale-100">
            <form id="prompt-form">
                <div class="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-white">${title}</h3>
                    <button type="button" class="btn-cancel text-gray-400 hover:text-gray-600 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div class="p-6 space-y-4">${fieldsHTML}</div>
                <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button type="button" class="btn-cancel px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition">Batal</button>
                    <button type="submit" class="btn-confirm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">Simpan</button>
                </div>
            </form>
        </div>
      `;
    const close = () => { modal.classList.add("hidden"); modal.innerHTML = ""; };
    modal.querySelector("#prompt-form").onsubmit = (e) => {
      e.preventDefault();
      const results = {};
      fields.forEach(field => { results[field.id] = document.getElementById(field.id).value; });
      close();
      resolve(results);
    };
    modal.querySelectorAll(".btn-cancel").forEach(btn => {
      btn.onclick = () => { close(); resolve(null); };
    });
  });
}


/// ============================
// FUNGSI TAMBAH ADMIN (MODIFIKASI)
// ============================
async function showAddAdminModal() {
    // Tampilkan Prompt hanya Username & Password
    const result = await showPrompt({
        title: "Tambah Admin Baru",
        fields: [
            { id: "username", label: "Username Admin", required: true, placeholder: "Masukkan username" },
            { id: "password", label: "Password", type: "password", required: true, placeholder: "Buat password awal" }
        ]
    });

    if (!result) return;

    // OTOMATIS SET ROLE JADI 'admin'
    // Superadmin tidak perlu memilih role lagi
    const payload = {
        username: result.username,
        password: result.password,
        role: 'admin' 
    };

    try {
        const res = await fetch(`${API_BASE_URL}/admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        });
        
        const j = await res.json();
        if (!res.ok) throw new Error(j.message);
        
        showToast("Admin baru berhasil ditambahkan!", "success");
        loadContent("manajemen-admin"); // Refresh halaman
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ============================
// MODAL EDIT PROFIL (GANTI PASSWORD)
// ============================
window.showProfileModal = () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const modal = document.getElementById("modal-container");
    
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md m-auto overflow-hidden transform transition-all scale-100 animate-fade-in">
            <div class="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <i class="bi bi-shield-lock-fill text-indigo-600"></i> Keamanan Akun
                </h3>
                <button onclick="document.getElementById('modal-container').classList.add('hidden')" class="text-gray-400 hover:text-red-500 text-2xl leading-none">&times;</button>
            </div>
            
            <form id="profileForm" class="p-6 space-y-4">
                <div class="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg flex items-center gap-3 border border-indigo-100 dark:border-indigo-800">
                    <div class="w-10 h-10 rounded-full bg-indigo-200 dark:bg-indigo-700 flex items-center justify-center text-indigo-700 dark:text-white font-bold">
                        ${currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="text-xs text-indigo-500 uppercase font-bold">Username Anda</p>
                        <p class="text-sm font-bold text-gray-800 dark:text-white">${currentUser.username}</p>
                    </div>
                </div>

                <input type="hidden" id="profUser" value="${currentUser.username}">

                <hr class="border-gray-200 dark:border-gray-700 border-dashed">
                <p class="text-xs text-gray-500 dark:text-gray-400 text-center">Isi kolom di bawah jika ingin mengganti password</p>

                <div>
                    <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Password Lama</label>
                    <div class="relative">
                        <input type="password" id="profOldPass" class="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition" placeholder="Konfirmasi password saat ini">
                        <i class="bi bi-key absolute right-3 top-2.5 text-gray-400"></i>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Password Baru</label>
                    <div class="relative">
                        <input type="password" id="profNewPass" class="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition" placeholder="Password baru">
                        <i class="bi bi-lock absolute right-3 top-2.5 text-gray-400"></i>
                    </div>
                </div>

                <div class="pt-4 flex justify-end gap-2">
                    <button type="button" onclick="document.getElementById('modal-container').classList.add('hidden')" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium text-sm">Batal</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md transition flex items-center gap-2 text-sm">
                        <i class="bi bi-check-circle"></i> Simpan Password
                    </button>
                </div>
            </form>
        </div>
    `;

    document.getElementById("profileForm").onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector("button[type='submit']");
        const originalText = btn.innerHTML;
        
        const username = document.getElementById("profUser").value;
        const oldPassword = document.getElementById("profOldPass").value;
        const newPassword = document.getElementById("profNewPass").value;

        if(!oldPassword || !newPassword) {
            showToast("Harap isi password lama dan password baru.", "error");
            return;
        }

        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Loading...`;

        try {
            // Panggil API Auth Controller (updateProfile)
            const res = await fetch(`${API_BASE_URL}/auth/profile`, { 
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ username, oldPassword, newPassword })
            });
            
            const json = await res.json();
            if(!res.ok) throw new Error(json.message);

            showToast("Password berhasil diganti! Silakan login ulang.", "success");
            document.getElementById('modal-container').classList.add('hidden');

            // Logout otomatis
            setTimeout(() => {
                localStorage.clear();
                window.location.replace("login.html");
            }, 2000);

        } catch (err) {
            showToast(err.message, "error");
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    };
};

// ============================
// FUNGSI KHUSUS BACKUP (UPDATED)
// ============================

async function loadBackupTable() {
  const tableBody = document.getElementById("backup-table-body");

  if (!tableBody) return;

  // Tampilkan loading state
  tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500 dark:text-gray-400">Memuat data backup...</td></tr>`;

  try {
    const res = await fetch(`${API_BASE_URL}/backup`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const files = data.data || [];

    // Jika data kosong
    if (!files.length) {
      tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500 dark:text-gray-400">Belum ada file backup.</td></tr>`;

      return;
    }

    // Render baris tabel
    const rows = files.map((file, index) => {
      const { tanggal, waktu } = formatBackupDate(file.time);
      return `
        <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${file.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${tanggal}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${waktu}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                <button class="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors" onclick="downloadBackup('${file.name}')">Download</button>
                <button class="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors" onclick="deleteBackup('${file.name}')">Hapus</button>
            </td>
        </tr>
      `;
    }).join('');

    tableBody.innerHTML = rows;

  } catch (err) {
    showToast(`Gagal memuat daftar backup: ${err.message}`, 'error');
    tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500">Gagal memuat data.</td></tr>`;
  }
}

// Fungsi helper format tanggal (Tidak ada perubahan)
function formatBackupDate(dateString) {
  const date = new Date(dateString);
  const optionsTanggal = { year: 'numeric', month: 'long', day: 'numeric' };
  const optionsWaktu = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  return {
    tanggal: date.toLocaleDateString('id-ID', optionsTanggal),
    waktu: date.toLocaleTimeString('id-ID', optionsWaktu).replace(/\./g, ':')
  };
}

// Fungsi download (Tidak ada perubahan)
async function downloadBackup(filename) {
  showToast(`Mempersiapkan download: ${filename}`, 'success');
  try {
    const res = await fetch(`${API_BASE_URL}/backup/${filename}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: 'File tidak ditemukan atau rusak.' }));
      throw new Error(errData.message);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (err) {
    showToast(`Gagal mengunduh file: ${err.message}`, 'error');
  }
}

// Fungsi hapus 
async function deleteBackup(filename) {
  const confirmed = await showConfirm("Hapus Backup", `Yakin ingin menghapus file backup: ${filename}?`);
  
  if (!confirmed) return;
  
  try {
    const res = await fetch(`${API_BASE_URL}/backup/${filename}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    
    showToast(result.message || 'File backup berhasil dihapus.');
    await loadBackupTable();
  } catch (err) {
    showToast(`Gagal menghapus file: ${err.message}`, 'error');
  }
}

// ============================
// FUNGSI RENDER GRAFIK HASIL
// ============================
function renderWeightedChart(kriteriaData, weightedData) {
  const ctx = document.getElementById('weightedChart');
  if (!ctx) return;
  const labels = kriteriaData.map(k => k.nama);
  const datasets = weightedData.map((altData, index) => {
    const scores = kriteriaData.map(k => altData[k.kode] || 0);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const color = colors[index % colors.length];
    return {
      label: altData.alternatif_nama,
      data: scores,
      borderColor: color,
      backgroundColor: color + '20',
      pointBackgroundColor: color,
      pointHoverRadius: 6,
      pointHoverBorderWidth: 2,
      pointHoverBorderColor: '#ffffff',
      fill: true,
      tension: 0.3
    };
  });
  if (myWeightedChart) {
    myWeightedChart.destroy();
  }
  myWeightedChart = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: { labels: labels, datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#4B5563' } },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: '#1F2937',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 4,
          displayColors: true,
        }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#E5E7EB' }, ticks: { color: '#4B5563' } },
        x: { grid: { display: false }, ticks: { color: '#4B5563' } }
      }
    }
  });
}

// ============================
// FUNGSI RENDER GRAFIK DASHBOARD
// ============================
function renderDashboardChart(rankingData) {
  const ctx = document.getElementById('dashboard-chart');
  if (!ctx) return;
  const sortedData = [...rankingData].sort((a, b) => b.nilai - a.nilai);
  const labels = sortedData.map(r => r.alternatif_nama);
  const scores = sortedData.map(r => r.nilai);

  // Tentukan warna teks berdasarkan dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');
  const axisColor = isDarkMode ? '#cbd5e1' : '#4B5563'; // slate-300 atau gray-600
  const gridColor = isDarkMode ? '#374151' : '#E5E7EB'; // gray-700 atau gray-200

  if (myDashboardChart) {
    myDashboardChart.destroy();
  }
  myDashboardChart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Skor Akhir (V)',
        data: scores,
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)', 'rgba(236, 72, 153, 0.7)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)', 'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)', 'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Skor Akhir (V)', color: axisColor },
          ticks: { color: axisColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: {
            color: axisColor,
            callback: function (value, index, values) {
              const label = this.getLabelForValue(value);
              return (label.length > 15) ? label.substring(0, 15) + '...' : label;
            }
          },
          grid: { display: false }
        }
      }
    }
  });
}

// ============================
// FUNGSI TAMBAH ADMIN (Hanya Admin Biasa)
// ============================
async function showAddAdminModal() {
    const result = await showPrompt({
        title: "Tambah Staff Admin",
        fields: [
            { id: "username", label: "Username Baru", required: true, placeholder: "Contoh: admin_gudang" },
            { id: "password", label: "Password Awal", type: "password", required: true, placeholder: "Buat password..." }
        ]
    });

    if (!result) return;

    const payload = {
        username: result.username,
        password: result.password,
        role: 'admin' // <--- DIKUNCI: Selalu admin biasa
    };

    try {
        const res = await fetch(`${API_BASE_URL}/admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        });
        
        const j = await res.json();
        if (!res.ok) throw new Error(j.message);
        
        showToast("Admin staff berhasil ditambahkan.", "success");
        loadContent("manajemen-admin");
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ============================
// LOGIKA CHATBOT (STYLE BARU)
// ============================

async function handleChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const emptyState = document.getElementById('empty-state');
    const message = input.value.trim();

    if (!message) return;

    // Hilangkan welcome screen
    if (emptyState) emptyState.style.display = 'none';

    input.disabled = true;
    sendBtn.disabled = true;

    // 1. TAMPILKAN & SIMPAN Pesan User
    addMessageToChat(message, 'user');
    saveChatHistory({ sender: 'user', text: message }); // <--- SIMPAN KE STORAGE

    input.value = '';

    const typingId = 'typing-' + Date.now();
    addMessageToChat('...', 'bot', typingId);

    try {
        const res = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: message })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Gagal menghubungi AI.");
        }

        const data = await res.json();

        // Hapus bubble typing
        const typingBubble = document.getElementById(typingId);
        if (typingBubble) typingBubble.remove();

        // 2. TAMPILKAN & SIMPAN Balasan Bot
        addMessageToChat(data.reply, 'bot');
        saveChatHistory({ sender: 'bot', text: data.reply }); // <--- SIMPAN KE STORAGE

    } catch (err) {
        console.error("Error chat AI:", err);
        const typingBubble = document.getElementById(typingId);
        if (typingBubble) typingBubble.remove();
        
        const errorMsg = `⚠️ Maaf, terjadi kesalahan: ${err.message}`;
        addMessageToChat(errorMsg, 'bot');
        
        // Opsional: Simpan error juga
        // saveChatHistory({ sender: 'bot', text: errorMsg });
        
    } finally {
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

function addMessageToChat(message, sender, elementId = null) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const config = getChatConfig();

    const wrapper = document.createElement('div');
    wrapper.className = "w-full max-w-3xl mx-auto flex gap-4 mb-6 animate-fade-in"; 
    if (elementId) wrapper.id = elementId;

    // --- PERBAIKAN UTAMA DI SINI ---
    let contentHtml = '';

    if (sender === 'user') {
        // User tetap text biasa agar aman
        contentHtml = `<p class="leading-relaxed whitespace-pre-wrap text-sm">${message}</p>`;
    } else {
        // Bot menggunakan Marked.js untuk merapikan format
        if (message === '...') {
            // Animasi Typing
            contentHtml = `
                <div class="flex space-x-1 h-6 items-center">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>`;
        } else {
            // Parsing Markdown ke HTML yang Rapi
            // Kita konfigurasi agar baris baru (<br>) ditangani dengan benar
            marked.setOptions({
                breaks: true, // Enter menjadi <br>
                gfm: true     // GitHub Flavored Markdown (tabel, strikethrough, dll)
            });
            
            const rawHtml = marked.parse(message);
            // Bersihkan HTML (Sanitize) agar aman dari XSS
            const cleanHtml = DOMPurify.sanitize(rawHtml);
            
            // Bungkus dengan div class khusus untuk styling list/heading
            contentHtml = `<div class="markdown-body text-sm leading-relaxed space-y-2">${cleanHtml}</div>`;
        }
    }
    // -------------------------------

    if (sender === 'user') {
        // === TAMPILAN USER (KANAN) ===
        wrapper.classList.add('justify-end');
        let userAvatarHtml;
        if (config.userAvatar) {
            userAvatarHtml = `<img src="${config.userAvatar}" class="w-8 h-8 rounded-full object-cover shadow border border-white/20">`;
        } else {
            userAvatarHtml = `
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow">
                    ${user.username.charAt(0).toUpperCase()}
                </div>`;
        }

        wrapper.innerHTML = `
            <div class="flex flex-col items-end max-w-[80%]">
                <div class="bg-indigo-600 text-white px-5 py-3 rounded-[20px] rounded-tr-sm shadow-md">
                    ${contentHtml}
                </div>
            </div>
            ${userAvatarHtml} 
        `;
    } else {
        // === TAMPILAN BOT (KIRI) ===
        wrapper.classList.add('justify-start');
        let botAvatarHtml;
        if (config.botAvatar) {
            botAvatarHtml = `<img src="${config.botAvatar}" class="w-8 h-8 rounded-full object-cover shadow border border-gray-200">`;
        } else {
            botAvatarHtml = `
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-sm border border-white/10">
                    <i class="bi bi-robot"></i>
                </div>`;
        }

        wrapper.innerHTML = `
            ${botAvatarHtml} 
            <div class="flex flex-col max-w-[85%]">
                <div class="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Asisten</div>
                <div class="px-1 py-1 text-gray-800 dark:text-gray-100">
                    ${contentHtml}
                </div>
            </div>
        `;
    }

    messagesContainer.appendChild(wrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return wrapper;
}

// ============================
// MANAJEMEN RIWAYAT CHAT (LOCAL STORAGE)
// ============================
function getChatHistory() {
    // Gunakan username sebagai kunci agar chat user A tidak muncul di user B
    const key = `chat_history_${user.username}`; 
    const history = localStorage.getItem(key);
    return history ? JSON.parse(history) : [];
}

function saveChatHistory(entry) {
    const key = `chat_history_${user.username}`;
    const history = getChatHistory();
    history.push(entry);
    localStorage.setItem(key, JSON.stringify(history));
}

// Opsional: Fungsi ini bisa dipanggil jika Admin ingin menghapus chat user tertentu
function clearChatHistory() {
    const key = `chat_history_${user.username}`;
    localStorage.removeItem(key);
    // Refresh tampilan jika sedang di halaman chat
    const chatContainer = document.getElementById('chat-messages');
    if(chatContainer) chatContainer.innerHTML = ''; 
}

// ============================
// MANAJEMEN CONFIG (AVATAR) PER USER
// ============================
function getChatConfig() {
    const key = `chat_config_${user.username}`;
    const config = localStorage.getItem(key);
    // Default: userAvatar null, botAvatar null
    return config ? JSON.parse(config) : { userAvatar: null, botAvatar: null };
}

function saveChatConfig(newConfig) {
    const key = `chat_config_${user.username}`;
    const currentConfig = getChatConfig();
    // Gabungkan config lama dengan yang baru
    const finalConfig = { ...currentConfig, ...newConfig };
    localStorage.setItem(key, JSON.stringify(finalConfig));
}

// ==========================================
// FUNGSI GATEKEEPER (PENJAGA HALAMAN) verifikasi 2 langkah
// ==========================================
function promptAccessVerification(onSuccess) {
    const modal = document.getElementById("modal-container");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm m-auto transform transition-all scale-100 overflow-hidden border border-red-100 dark:border-red-900/30 animate-fade-in">
            <div class="p-6 text-center">
                <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <i class="bi bi-shield-lock-fill text-3xl text-red-600 dark:text-red-500"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Area Terbatas</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Halaman ini dilindungi. Masukkan password Super Admin untuk melanjutkan.
                </p>
                
                <form id="gatekeeperForm" class="space-y-4">
                    <div class="relative">
                        <input type="password" id="gatePass" 
                            class="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white transition shadow-sm" 
                            placeholder="Password Anda..." required autofocus>
                        <i class="bi bi-key-fill absolute right-3 top-3.5 text-gray-400"></i>
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="button" id="btnCancelGate" class="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition">
                            Batal
                        </button>
                        <button type="submit" id="btnSubmitGate" class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition">
                            Buka Akses
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setTimeout(() => document.getElementById("gatePass").focus(), 100);

    // Handle Cancel (Balik ke Dashboard)
    document.getElementById("btnCancelGate").onclick = () => {
        modal.classList.add("hidden");
        loadContent('dashboard'); // Tendang balik ke dashboard
    };

    // Handle Submit
    document.getElementById("gatekeeperForm").onsubmit = async (e) => {
        e.preventDefault();
        const password = document.getElementById("gatePass").value;
        const btn = document.getElementById("btnSubmitGate");
        
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Cek...';

        try {
            // Cek Password ke Backend
            const res = await fetch(`${API_BASE_URL}/auth/verify-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // SUKSES! Tutup modal dan jalankan fungsi halaman
                modal.classList.add("hidden");
                showToast("Akses diberikan!", "success");
                onSuccess(); // <--- INI KUNCINYA (Load Konten)
            } else {
                showToast("Password salah! Akses ditolak.", "error");
                btn.disabled = false;
                btn.innerHTML = 'Buka Akses';
                document.getElementById("gatePass").value = "";
                document.getElementById("gatePass").focus();
            }
        } catch (err) {
            showToast("Terjadi kesalahan server.", "error");
            btn.disabled = false;
            btn.innerHTML = 'Buka Akses';
        }
    };
}

// ============================================================
// 1. FUNGSI GATEKEEPER (PENJAGA HALAMAN)
// ============================================================
function promptAccessVerification(onSuccess) {
    const modal = document.getElementById("modal-container");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // Variabel untuk menghitung klik logo (Internal)
    let logoClickCount = 0;

    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm m-auto p-6 border border-red-100 dark:border-red-900/30 animate-fade-in">
            <div class="text-center">
                <div id="secretLogo" class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4 cursor-pointer active:scale-90 transition-transform select-none">
                    <i class="bi bi-shield-lock-fill text-3xl text-red-600"></i>
                </div>
                
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Area Terbatas</h3>
                <p class="text-sm text-gray-500 mb-6">Masukkan password verifikasi.</p>
                
                <form id="gatekeeperForm" class="space-y-4">
                    <input type="password" id="gatePass" class="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500" placeholder="Password..." required>
                    <button type="submit" id="btnSubmitGate" class="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition">Buka Akses</button>
                    <button type="button" id="btnCancelGate" class="w-full py-2 text-gray-400 text-sm">Batal</button>
                </form>
            </div>
        </div>
    `;

    // LOGIKA RAHASIA: Klik Logo 20 Kali
    const logo = document.getElementById("secretLogo");
    logo.addEventListener("click", () => {
        logoClickCount++;
        
        // Opsional: Beri feedback tipis di console agar kamu tahu jumlah kliknya
        console.log(`Ssstt... Klik ke-${logoClickCount}`);

        if (logoClickCount === 20) {
            showToast("Fitur Rahasia Terbuka!", "success");
            showChangeGatePassModal(); // Buka modal ganti password
            logoClickCount = 0; // Reset hitungan
        }
    });

    // Logika Tombol Batal
    document.getElementById("btnCancelGate").onclick = () => {
        modal.classList.add("hidden");
        loadContent('dashboard'); 
    };

    // Logika Submit Password (Sama seperti sebelumnya)
    document.getElementById("gatekeeperForm").onsubmit = async (e) => {
        e.preventDefault();
        const password = document.getElementById("gatePass").value;
        const btn = document.getElementById("btnSubmitGate");
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/verify-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                modal.classList.add("hidden");
                onSuccess(); 
            } else {
                showToast("Password salah!", "error");
                btn.disabled = false;
            }
        } catch (err) {
            showToast("Server Error", "error");
            btn.disabled = false;
        }
    };
}

// ============================================================
// MODAL GANTI PASSWORD KHUSUS (AREA TERBATAS) - VERSI PERBAIKAN
// ============================================================
window.showChangeGatePassModal = () => {
    const modal = document.getElementById("modal-container");
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm m-auto p-6 animate-fade-in border border-gray-100 dark:border-gray-700">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2 text-center">Ganti Password Gate</h3>
            <p class="text-xs text-gray-500 mb-6 text-center italic">Mode Rahasia Diaktifkan</p>
            
            <form id="formChangeGate" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Password Saat Ini</label>
                    <input type="password" id="oldGatePass" class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Password lama/login" required>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Password Baru</label>
                    <input type="password" id="newGatePass" class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Buat password baru" required>
                </div>
                
                <div class="flex gap-3 mt-6">
                    <button type="button" id="btnCancelSecret" class="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold">Batal</button>
                    <button type="submit" id="btnSaveGatePass" class="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg transition">Simpan</button>
                </div>
            </form>
        </div>
    `;

    // Tombol Batal di modal rahasia
    document.getElementById("btnCancelSecret").onclick = () => {
        modal.classList.add("hidden");
        modal.innerHTML = "";
    };

    document.getElementById("formChangeGate").onsubmit = async (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById("oldGatePass").value;
        const newPassword = document.getElementById("newGatePass").value;
        
        try {
            const res = await fetch(`${API_BASE_URL}/auth/change-gate-password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message, "success");
                modal.classList.add("hidden"); // Tutup setelah sukses
            } else {
                showToast(data.message, "error");
            }
        } catch (err) {
            showToast("Gagal menghubungi server", "error");
        }
    };
};

// ==========================================
// MODAL SETTINGS/TAMPILAN TOKO
// ==========================================

// Fungsi bantuan untuk menampilkan Konfirmasi Custom (Pengganti alert bawaan)
const showCustomConfirm = (title, message, onConfirm) => {
    // Membuat elemen div untuk modal konfirmasi
    const confirmModal = document.createElement('div');
    confirmModal.className = 'fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
    
    // HTML untuk tampilan alert
    confirmModal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 border border-gray-100 dark:border-gray-700">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                    <i class="bi bi-exclamation-triangle text-xl text-red-600 dark:text-red-400"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">${title}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">${message}</p>
            </div>
            <div class="flex gap-3">
                <button id="btnCancelConfirm" class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    Batal
                </button>
                <button id="btnYesConfirm" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-600/30 transition">
                    Ya, Hapus
                </button>
            </div>
        </div>
    `;

    // Masukkan modal ke dalam body
    document.body.appendChild(confirmModal);

    // Event Listener tombol Batal
    confirmModal.querySelector('#btnCancelConfirm').addEventListener('click', () => {
        confirmModal.remove(); // Hapus modal dari DOM
    });

    // Event Listener tombol Ya
    confirmModal.querySelector('#btnYesConfirm').addEventListener('click', () => {
        onConfirm(); // Jalankan logika penghapusan
        confirmModal.remove(); // Hapus modal setelah selesai
    });
};

    
window.openSettingsModal = async () => {
    const modal = document.getElementById("modal-container");
    
    // Menampilkan container modal utama
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    
    // Tampilan loading sementara
    modal.innerHTML = `<div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex items-center gap-3"><span class="spinner-border text-indigo-600"></span><span class="text-gray-600 dark:text-gray-300">Memuat pengaturan...</span></div>`;

    try {
        // Mengambil data pengaturan dari server
        const res = await fetch(`${API_BASE_URL}/settings`);
        const data = await res.json();
        
        // Menetapkan nilai default jika data kosong
        const appName = data.app_name || "Marhaban Parfume";
        const bgUrl = data.background_url || ""; 
        const logoUrl = data.logo_url || "";

        // Merender tampilan HTML Modal Pengaturan Utama
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl m-auto overflow-hidden flex flex-col max-h-[90vh]">
                
                <div class="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <i class="bi bi-palette text-indigo-600"></i> Pengaturan Tampilan Toko
                    </h3>
                    <button onclick="document.getElementById('modal-container').classList.add('hidden')" class="text-gray-400 hover:text-red-500 text-2xl leading-none transition">&times;</button>
                </div>

                <div class="flex-1 overflow-y-auto p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        <form id="brandingForm" class="space-y-6">
                            <div>
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nama Toko</label>
                                <input type="text" id="confAppName" value="${appName}" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Background Login</label>
                                <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30 text-center hover:bg-indigo-50 dark:hover:bg-gray-700 transition relative group">
                                    
                                    <div id="bgPreviewBox" class="${bgUrl ? '' : 'hidden'} w-full h-32 bg-cover bg-center rounded mb-3 shadow-sm relative" style="background-image: url('${bgUrl}');">
                                        <button type="button" id="btnDeleteBg" class="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow-md transition" title="Hapus Background">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>

                                    <input type="file" id="bgInput" accept="image/*" class="hidden">
                                    <label for="bgInput" class="cursor-pointer inline-flex items-center px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500">
                                        <i class="bi bi-image mr-2"></i> Ganti Background
                                    </label>
                                    <p class="text-xs text-gray-500 mt-2">Disarankan ukuran 1920x1080 (HD).</p>
                                    <input type="hidden" id="isDeleteBg" value="false">
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Logo Toko</label>
                                <div class="flex items-center gap-4">
                                    <div class="relative w-20 h-20 bg-gray-100 dark:bg-gray-600 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden">
                                        <img id="logoPreview" src="${logoUrl}" class="${logoUrl ? '' : 'hidden'} w-full h-full object-contain p-1">
                                        <i id="logoPlaceholder" class="bi bi-image text-2xl text-gray-400 ${logoUrl ? 'hidden' : ''}"></i>
                                    </div>
                                    <div class="flex-1">
                                        <input type="file" id="logoInput" accept="image/*" class="hidden">
                                        <label for="logoInput" class="cursor-pointer px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition inline-block mb-2">
                                            <i class="bi bi-upload mr-1"></i> Pilih Logo
                                        </label>
                                        <br>
                                        <button type="button" id="btnDeleteLogo" class="text-xs text-red-500 hover:text-red-700 hover:underline ${logoUrl ? '' : 'hidden'}">
                                            <i class="bi bi-trash"></i> Hapus Logo
                                        </button>
                                        <input type="hidden" id="isDeleteLogo" value="false">
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div class="relative">
                            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Preview</h3>
                            
                            <div class="relative w-full aspect-[9/16] sm:aspect-video bg-slate-900 rounded-xl shadow-inner border-4 border-gray-800 overflow-hidden group">
                                
                                <div id="previewBg" class="absolute inset-0 bg-cover bg-center transition-all duration-500" style="background-image: url('${bgUrl}'); background-color: #0f172a;">
                                    <div class="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-900/60"></div>
                                </div>
                                
                                <div class="absolute inset-0 flex items-center justify-center p-4">
                                    <div class="bg-white/90 backdrop-blur-md border border-white/50 p-5 rounded-xl shadow-2xl w-56 text-center transform transition-transform scale-75 group-hover:scale-90 relative">
                                        
                                        <div class="relative inline-block mb-3">
                                            <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-20"></div>
                                            
                                            <img id="previewLogoImg" src="${logoUrl}" class="${logoUrl ? '' : 'hidden'} relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-md bg-white">
                                            
                                            <div id="previewLogoIcon" class="${logoUrl ? 'hidden' : ''} relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white border-2 border-white shadow-md">
                                                <i class="bi bi-bag-heart-fill text-xl"></i>
                                            </div>
                                        </div>
                                        
                                        <h4 id="previewTitle" class="font-bold text-slate-800 text-base leading-tight mb-1">${appName}</h4>
                                        <p class="text-[10px] text-slate-500 mb-4 font-medium">Silakan masuk</p>
                                        
                                        <div class="space-y-2 mb-4 text-left">
                                            <div><div class="h-6 bg-white border border-slate-200 rounded w-full"></div></div>
                                            <div><div class="h-6 bg-white border border-slate-200 rounded w-full"></div></div>
                                        </div>

                                        <div class="h-8 bg-slate-900 rounded-lg w-full shadow-lg flex items-center justify-center">
                                            <div class="h-1.5 w-16 bg-white/90 rounded"></div>
                                        </div>

                                        <div class="mt-3 border-t border-slate-200 pt-2">
                                            <div class="h-1 w-20 bg-gray-300 mx-auto rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="text-center text-[10px] text-gray-400 mt-2">Tampilan pratinjau login.</p>
                        </div>

                    </div>
                </div>

                <div class="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
                    <button onclick="document.getElementById('modal-container').classList.add('hidden')" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">Batal</button>
                    <button id="btnSaveSettings" class="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md transition flex items-center gap-2">
                        <i class="bi bi-check-lg"></i> Simpan Perubahan
                    </button>
                </div>
            </div>
        `;

        // --- DEFINISI VARIABEL ELEMENT DOM ---
        const inpName = document.getElementById('confAppName');
        const bgInput = document.getElementById('bgInput');
        const bgPreviewBox = document.getElementById('bgPreviewBox');
        const btnDeleteBg = document.getElementById('btnDeleteBg');
        const isDeleteBg = document.getElementById('isDeleteBg');
        const previewBg = document.getElementById('previewBg');
        const logoInput = document.getElementById('logoInput');
        const isDeleteLogo = document.getElementById('isDeleteLogo');
        const btnDeleteLogo = document.getElementById('btnDeleteLogo');
        const saveBtn = document.getElementById('btnSaveSettings');

        // --- EVENT: GANTI BACKGROUND (PREVIEW) ---
        bgInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Update preview kecil dan besar
                    bgPreviewBox.style.backgroundImage = `url('${e.target.result}')`;
                    bgPreviewBox.classList.remove('hidden');
                    previewBg.style.backgroundImage = `url('${e.target.result}')`;
                    isDeleteBg.value = "false"; // Reset status hapus
                }
                reader.readAsDataURL(file);
            }
        });

        // --- EVENT: HAPUS BACKGROUND (CUSTOM ALERT) ---
        btnDeleteBg.addEventListener('click', () => {
            // Menggunakan Custom Alert, bukan confirm() bawaan browser
            showCustomConfirm(
                "Hapus Background?", 
                "Tindakan ini akan menghapus gambar background dan kembali ke warna default.", 
                () => {
                    // Logika Penghapusan Background (Tetap sama)
                    bgPreviewBox.style.backgroundImage = '';
                    bgPreviewBox.classList.add('hidden');
                    previewBg.style.backgroundImage = ''; 
                    previewBg.style.backgroundColor = '#0f172a'; 
                    bgInput.value = "";
                    isDeleteBg.value = "true"; // Menandai untuk dihapus di server
                }
            );
        });

        // --- EVENT: GANTI LOGO (PREVIEW) ---
        logoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Update semua elemen logo (preview kecil, preview besar, icon placeholder)
                    document.getElementById('logoPreview').src = e.target.result;
                    document.getElementById('logoPreview').classList.remove('hidden');
                    document.getElementById('logoPlaceholder').classList.add('hidden');
                    document.getElementById('previewLogoImg').src = e.target.result;
                    document.getElementById('previewLogoImg').classList.remove('hidden');
                    document.getElementById('previewLogoIcon').classList.add('hidden');
                    btnDeleteLogo.classList.remove('hidden');
                    isDeleteLogo.value = "false";
                }
                reader.readAsDataURL(file);
            }
        });

        // --- EVENT: HAPUS LOGO (CUSTOM ALERT) ---
        btnDeleteLogo.addEventListener('click', () => {
            // Menggunakan Custom Alert
            showCustomConfirm(
                "Hapus Logo?", 
                "Apakah Anda yakin ingin menghapus logo toko? Icon default akan digunakan.", 
                () => {
                    // Logika Penghapusan Logo (Tetap sama)
                    document.getElementById('logoPreview').src = "";
                    document.getElementById('logoPreview').classList.add('hidden');
                    document.getElementById('logoPlaceholder').classList.remove('hidden');
                    document.getElementById('previewLogoImg').classList.add('hidden');
                    document.getElementById('previewLogoIcon').classList.remove('hidden');
                    btnDeleteLogo.classList.add('hidden');
                    logoInput.value = "";
                    isDeleteLogo.value = "true"; // Menandai untuk dihapus di server
                }
            );
        });

        // --- EVENT: UPDATE NAMA TOKO REALTIME ---
        inpName.addEventListener('input', () => {
            document.getElementById('previewTitle').innerText = inpName.value || "Nama Toko";
        });

        // --- EVENT: SIMPAN PERUBAHAN KE SERVER ---
        saveBtn.addEventListener('click', async () => {
            // Ubah tombol jadi loading
            saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm mr-2"></span> Menyimpan...`;
            saveBtn.disabled = true;

            const formData = new FormData();
            formData.append('app_name', inpName.value);
            formData.append('delete_logo', isDeleteLogo.value);
            formData.append('delete_background', isDeleteBg.value);

            // Lampirkan file hanya jika user memilih file baru
            if (logoInput.files[0]) formData.append('logo', logoInput.files[0]);
            if (bgInput.files[0]) formData.append('background', bgInput.files[0]);

            try {
                const res = await fetch(`${API_BASE_URL}/settings`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (!res.ok) throw new Error("Gagal update");
                
                showToast("Tampilan berhasil diperbarui!", "success");
                document.getElementById('modal-container').classList.add('hidden');
            } catch (err) {
                showToast("Error: " + err.message, "error");
                // Reset tombol jika gagal
                saveBtn.innerHTML = `<i class="bi bi-check-lg"></i> Simpan Perubahan`;
                saveBtn.disabled = false;
            }
        });

    } catch (err) {
        console.error(err);
        modal.innerHTML = `<div class="bg-white p-6 rounded text-red-500">Gagal memuat pengaturan.</div>`;
    }
};

// Jalankan dashboard pertama kali
window.addEventListener("DOMContentLoaded", () => {
  loadContent('dashboard');

  // EVENT LISTENER UNTUK CHATBOT
  const chatForm = document.getElementById("chat-form");
  const chatBubble = document.getElementById("chat-bubble");
  const chatClose = document.getElementById("chat-close");

  if (chatForm) {
    chatForm.addEventListener("submit", handleChatSubmit);
  }
  if (chatBubble) {
    chatBubble.addEventListener("click", () => {
      document.getElementById("chat-window").classList.toggle("hidden");
    });
  }
  if (chatClose) {
    chatClose.addEventListener("click", () => {
      document.getElementById("chat-window").classList.add("hidden");
    });
  }
});