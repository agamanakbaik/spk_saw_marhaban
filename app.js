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

// Jika belum login, redirect
if (!token) {
  alert("Sesi Anda berakhir. Silakan login ulang.");
  window.location.href = "login.html";
  throw new Error("Not authenticated");
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
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

// ============================
// LOAD HALAMAN SPA
// ============================
window.loadContent = async (page) => {
  const container = document.getElementById("content-container");
  if (mainHeader) {
    mainHeader.classList.add('shadow-md');
  }
  container.innerHTML = `<div class="p-8 text-gray-500 dark:text-gray-400 text-center">Memuat...</div>`;

  try {
    // ======================
    // DASHBOARD
    // ======================
    if (page === "dashboard") {
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
      try {
        const [altRes, kritRes, calcRes] = await Promise.all([
          fetch(`${API_BASE_URL}/alternatif`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/kriteria`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/perhitungan/hitung`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
        ]);
        const altData = await altRes.json();
        const kritData = await kritRes.json();
        if (!calcRes.ok) {
          throw new Error("Data perhitungan belum siap.");
        }
        const calcData = await calcRes.json();
        const totalAlternatif = (altData.data || altData || []).length;
        const totalKriteria = (kritData.data || kritData || []).length;
        const ranking = calcData.ranking || [];
        const peringkatSatu = ranking.find(r => r.rank === 1) || { alternatif_nama: "Belum Ada", nilai: 0 };
        const dashboardHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
            </div>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-6">Selamat datang, <b>${user.username}</b>!</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-green-500">
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Peringkat #1</h3>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white truncate" title="${peringkatSatu.alternatif_nama}">${peringkatSatu.alternatif_nama}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Skor Akhir: ${peringkatSatu.nilai.toFixed(4)}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Alternatif</h3>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white">${totalAlternatif}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Total alternatif yang dievaluasi</p>
                </div>
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Kriteria</h3>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white">${totalKriteria}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Total kriteria penilaian</p>
                </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Grafik Skor Akhir Alternatif</h3>
                <div style="height: 350px;">
                    <canvas id="dashboard-chart"></canvas>
                </div>
            </div>
            <div class="cetak-sembunyi">
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Aksi Cepat</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="loadContent('penilaian')" class="bg-blue-600 text-white p-4 rounded-lg shadow-md hover:bg-blue-700 transition font-semibold flex items-center justify-center">
                        <i class="bi bi-pencil-square mr-2"></i> Input Penilaian
                    </button>
                    <button onclick="loadContent('perhitungan')" class="bg-green-600 text-white p-4 rounded-lg shadow-md hover:bg-green-700 transition font-semibold flex items-center justify-center">
                        <i class="bi bi-bar-chart-line-fill mr-2"></i> Lihat Hasil Detail
                    </button>
                    <button onclick="loadContent('kriteria')" class="bg-gray-600 text-white p-4 rounded-lg shadow-md hover:bg-gray-700 transition font-semibold flex items-center justify-center">
                        <i class="bi bi-gear-fill mr-2"></i> Atur Kriteria
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = dashboardHTML;
        renderDashboardChart(ranking);
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
        container.innerHTML = `
            <h2 class="text-2xl font-bold mb-4 dark:text-white">Dashboard</h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-6">Selamat datang, <b>${user.username}</b>!</p>
            <div class="p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow-md">
                <strong>Data Perhitungan Belum Siap.</strong><br>
                <span class="text-sm">Anda perlu mengisi halaman "Nilai Alternatif" terlebih dahulu agar hasil perhitungan bisa tampil di dashboard.</span>
            </div>
        `;
      }
      return;
    }

   // ======================
    // DATA ALTERNATIF (Tombol Solid Style)
    // ======================
    if (page === "alternatif") {
        let allAlternatifData = []; 

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

        btnDeleteAll.addEventListener("click", async () => {
            if (allAlternatifData.length === 0) return showToast("Data kosong.", "error");
            const confirmed = await showConfirm("Hapus Semua?", "PERINGATAN: Semua data alternatif akan dihapus permanen.");
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

        // === FUNCTIONS ===
        async function loadAlternatifData() {
            try {
                const res = await fetch(`${API_BASE_URL}/alternatif`, { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                allAlternatifData = (data.data || data || []).sort((a, b) => a.id - b.id);
                badgeTotal.innerText = allAlternatifData.length;
                badgeTotal.classList.remove('hidden');
                renderAlternatifTable(allAlternatifData);
            } catch (err) {
                console.error(err);
                tableContainer.innerHTML = `<div class="p-10 text-center text-red-500">Gagal terhubung ke server.</div>`;
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
            const id = document.getElementById("altId").value;
            const payload = {
                kode_alternatif: document.getElementById("kodeAlt").value,
                nama_periode: document.getElementById("namaAlt").value,
                deskripsi: document.getElementById("descAlt").value,
            };
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
    // DATA KRITERIA (Full Code: Reset Font Medium)
    // ======================
    if (page === "kriteria") {
        let allKriteriaData = []; 
        window.currentKriteriaId = null;

        // 1. RENDER CONTAINER UTAMA
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
                const res = await fetch(`${API_BASE_URL}/kriteria`, { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                allKriteriaData = (Array.isArray(data) ? data : data.data || []).sort((a,b) => a.id - b.id);
                
                badgeTotal.innerText = allKriteriaData.length;
                badgeTotal.classList.remove('hidden');

                renderKriteriaTable(allKriteriaData);
            } catch (err) {
                tableContainer.innerHTML = `<div class="p-10 text-center text-red-500">Gagal memuat data.</div>`;
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
        // FUNGSI LOGIKA SUB KRITERIA (DENGAN SEARCH)
        // ============================================

        window.openSubKriteria = async function (id, namaKriteria) {
            window.currentKriteriaId = id;
            mainToolbar.style.display = "none"; 
            tableContainer.innerHTML = `<div class="p-10 text-center"><span class="spinner-border text-blue-500"></span> Memuat sub kriteria...</div>`;
            
            try {
                const res = await fetch(`${API_BASE_URL}/subkriteria?kriteria_id=${id}`, { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                let allSubData = (Array.isArray(data) ? data : data.data || []).sort((a,b) => a.id - b.id);

                const renderSubRows = (subData) => {
                    if (!subData.length) return `<tr><td colspan="5" class="p-12 text-center text-gray-400"><i class="bi bi-list-nested text-3xl mb-2"></i><br>Data tidak ditemukan.</td></tr>`;
                    
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

                const subHeader = `
                    <div class="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center bg-blue-50/50 dark:bg-blue-900/10 gap-4">
                        <div class="flex items-center gap-4 w-full md:w-auto">
                            <button onclick="loadKriteriaTable()" class="p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition shadow-sm" title="Kembali">
                                <i class="bi bi-arrow-left text-lg"></i>
                            </button>
                            <div>
                                <h3 class="text-lg font-bold text-gray-800 dark:text-white">Sub Kriteria</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Untuk: <b>${namaKriteria}</b></p>
                            </div>
                        </div>
                        
                        <div class="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
                            <div class="relative w-full md:w-48">
                                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <i class="bi bi-search text-xs"></i>
                                </span>
                                <input type="text" id="searchSubKrit" placeholder="Cari sub..." 
                                    class="pl-8 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
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
                                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nilai</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ket</th>
                                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="subTableBody" class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">${rowsHtml}</tbody>
                    </table>
                `;

                tableContainer.innerHTML = renderTable(renderSubRows(allSubData));

                const searchSubInput = document.getElementById('searchSubKrit');
                const tbody = document.getElementById('subTableBody');
                
                searchSubInput.addEventListener('input', (e) => {
                    const keyword = e.target.value.toLowerCase();
                    const filtered = allSubData.filter(s => 
                        s.nama.toLowerCase().includes(keyword) || 
                        (s.keterangan && s.keterangan.toLowerCase().includes(keyword))
                    );
                    tbody.innerHTML = renderSubRows(filtered);
                });

                const btnResetSub = document.getElementById('btnResetSub');
                if(btnResetSub) {
                    btnResetSub.addEventListener('click', async () => {
                        if (allSubData.length === 0) return showToast("Data kosong.", "error");
                        if (!await showConfirm("Reset Sub Kriteria?", `Hapus semua sub kriteria untuk "${namaKriteria}"?`)) return;

                        const originalHtml = btnResetSub.innerHTML;
                        btnResetSub.disabled = true;
                        btnResetSub.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

                        try {
                            const deletePromises = allSubData.map(item => 
                                fetch(`${API_BASE_URL}/subkriteria/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
                            );
                            await Promise.all(deletePromises);
                            showToast("Sub kriteria berhasil di-reset!", "success");
                            openSubKriteria(id, namaKriteria);
                        } catch (err) {
                            showToast("Gagal menghapus sebagian data.", "error");
                            openSubKriteria(id, namaKriteria);
                        }
                    });
                }

            } catch (err) {
                showToast(`Gagal: ${err.message}`, "error");
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
            e.preventDefault(); const id = document.getElementById("kritId").value;
            const payload = { kode: document.getElementById("kodeKrit").value, nama: document.getElementById("namaKrit").value, bobot: document.getElementById("bobotKrit").value, tipe: document.getElementById("tipeKrit").value };
            try {
                const res = await fetch(id ? `${API_BASE_URL}/kriteria/${id}` : `${API_BASE_URL}/kriteria`, { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
                if (!res.ok) throw new Error((await res.json()).message);
                showToast("Berhasil!"); closeKritModal(); loadKriteriaData();
            } catch (err) { showToast(err.message, "error"); }
        }
        window.deleteKrit = async (id) => { if (await showConfirm("Hapus?", "Yakin?")) { try { await fetch(`${API_BASE_URL}/kriteria/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); showToast("Terhapus!"); loadKriteriaData(); } catch (e) { showToast(e.message, "error"); } } };

        window.showSubKritModal = (data = {}) => {
            const modal = document.getElementById("modal-container"); modal.classList.remove("hidden"); modal.classList.add("flex");
            const kId = data.kriteria_id || window.currentKriteriaId;
            modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm m-auto overflow-hidden">
                    <div class="p-4 border-b bg-gray-50 dark:bg-gray-700 flex justify-between"><h3 class="font-bold dark:text-white">Sub Kriteria</h3><button onclick="closeSubKritModal()" class="text-2xl">&times;</button></div>
                    <form id="subForm" class="p-5 space-y-3">
                        <input type="hidden" id="sId" value="${data.id||''}"><input type="hidden" id="kId" value="${kId}">
                        <input class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" id="sNama" placeholder="Nama Sub" value="${data.nama||''}" required>
                        <input class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" type="number" id="sNilai" placeholder="Nilai" value="${data.nilai||''}" required>
                        <textarea class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" id="sKet" placeholder="Keterangan">${data.keterangan||''}</textarea>
                        <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded font-bold">Simpan</button>
                    </form>
                </div>`;
            document.getElementById("subForm").onsubmit = async (e) => {
                e.preventDefault();
                const p = { kriteria_id: parseInt(kId), nama: document.getElementById("sNama").value, nilai: parseInt(document.getElementById("sNilai").value), keterangan: document.getElementById("sKet").value };
                const url = p.id = document.getElementById("sId").value; 
                try { await fetch(url ? `${API_BASE_URL}/subkriteria/${url}` : `${API_BASE_URL}/subkriteria`, { method: url?"PUT":"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body:JSON.stringify(p)});
                closeSubKritModal(); openSubKriteria(kId, document.getElementById("pageTitle").innerText.split(": ")[1] || ""); } catch(err) { showToast(err.message, "error"); }
            };
        };
        window.closeSubKritModal = () => { document.getElementById("modal-container").classList.add("hidden"); document.getElementById("modal-container").innerHTML = ""; };
        window.deleteSubKrit = async (id, kId) => { if(await showConfirm("Hapus?", "Yakin?")) { try { await fetch(`${API_BASE_URL}/subkriteria/${id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}}); openSubKriteria(kId, document.getElementById("pageTitle").innerText.split(": ")[1] || ""); } catch(e) { showToast(e.message, "error"); } } };

        return;
    }

    // ======================
    // PENILAIAN
    // ======================
    if (page === "penilaian") {
      container.innerHTML = `<h2 class="text-2xl font-bold mb-4 dark:text-white">Penilaian Alternatif</h2><div id="penilaian-loader" class="text-gray-600 dark:text-gray-400">Memuat data...</div>`;
      const loader = document.getElementById("penilaian-loader");
      try {
        loader.innerText = "Memuat alternatif...";
        const [altRes, kritRes, penRes] = await Promise.all([
          fetch(`${API_BASE_URL}/alternatif`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/kriteria`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/penilaian`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const altJson = await altRes.json();
        const kritJson = await kritRes.json();
        const penJson = await penRes.json();
        const alternatifs = altJson.data || altJson || [];
        const kriterias = kritJson.data || kritJson || [];
        const penilaianData = penJson.data || penJson || [];
        if (kriterias.length === 0 || alternatifs.length === 0) {
          container.innerHTML = `<p class="text-red-500">Data Alternatif atau Kriteria masih kosong. Harap isi data tersebut terlebih dahulu.</p>`;
          return;
        }
        loader.innerText = "Memuat data sub-kriteria...";
        const subKriteriaMap = new Map();
        for (const k of kriterias) {
          const subRes = await fetch(
            `${API_BASE_URL}/subkriteria?kriteria_id=${k.id}`, { headers: { Authorization: `Bearer ${token}` } }
          );
          const subJson = await subRes.json();
          const subData = subJson.data || subJson || [];
          subKriteriaMap.set(k.id, subData);
        }
        const penilaianMap = new Map();
        penilaianData.forEach((p) => {
          if (p.nilai !== undefined && p.alternatif_id && p.kriteria_id) {
            penilaianMap.set(`${p.alternatif_id}-${p.kriteria_id}`, p.nilai);
          }
        });
        loader.innerText = "Merender tabel...";
        const tableHeaders = kriterias.map((k) => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${k.nama}</th>`).join("");
        const tableRows = alternatifs
          .map((a, index) => {
            const kriteriaCells = kriterias
              .map((k) => {
                const subKriterias = subKriteriaMap.get(k.id) || [];
                const currentValue = penilaianMap.get(`${a.id}-${k.id}`);
                const options = subKriterias.map((s) => `<option value="${s.nilai}" ${s.nilai == currentValue ? "selected" : ""}>${s.nama}</option>`).join("");
                return `
                        <td class="px-4 py-2 border-b dark:border-gray-700">
                            <select 
                                class="min-w-[160px] p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                data-alt-id="${a.id}" 
                                data-krit-id="${k.id}"
                            >
                                <option value="">- Pilih -</option>
                                ${options}
                            </select>
                        </td>
                        `;
              })
              .join("");
            return `
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-center">${index + 1}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">${a.nama_periode} (${a.deskripsi || "Tidak ada deskripsi"})</td>
                        ${kriteriaCells}
                    </tr>
                    `;
          })
          .join("");
        container.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Penilaian Alternatif</h2>
                    <nav class="text-sm" aria-label="Breadcrumb">
                      <ol class="list-none p-0 inline-flex">
                        <li class="flex items-center">
                  
                      </ol>
                    </nav>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <form id="penilaian-form">
                        <div class="overflow-x-auto">
                            <table class="min-w-full">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Alternatif</th>
                                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" colspan="${kriterias.length}">
                                            Nilai Kriteria
                                        </th>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3"></th>
                                        <th class="px-6 py-3"></th>
                                        ${tableHeaders}
                                    </tr>
                                </thead>
                                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    ${tableRows}
                                </tbody>
                            </table>
                        </div>
                        <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
                            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150">
                                Simpan Penilaian
                            </button>
                        </div>
                    </form>
                </div>
                `;
        document.getElementById("penilaian-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const btn = e.target.querySelector('button[type="submit"]');
          btn.disabled = true;
          btn.innerText = "Menyimpan...";
          try {
            const selects = e.target.querySelectorAll("select");
            const payload = [];
            selects.forEach((select) => {
              const nilai = select.value;
              if (nilai) {
                payload.push({
                  alternatif_id: parseInt(select.dataset.altId),
                  kriteria_id: parseInt(select.dataset.kritId),
                  nilai: parseFloat(nilai),
                });
              }
            });
            if (payload.length === 0) {
              showToast("Tidak ada data untuk disimpan.", "error");
              btn.disabled = false;
              btn.innerText = "Simpan";
              return;
            }
            const res = await fetch(`${API_BASE_URL}/penilaian/save-all`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            showToast(result.message || "Semua data berhasil disimpan!");
          } catch (err) {
            console.error("Gagal menyimpan batch:", err);
            showToast(`Terjadi kesalahan: ${err.message}`, "error");
          } finally {
            btn.disabled = false;
            btn.innerText = "Simpan Penilaian";
          }
        });
      } catch (err) {
        console.error("Error loading penilaian page:", err);
        container.innerHTML = `<p class="text-red-500">Gagal memuat halaman penilaian. ${err.message}</p>`;
      }
      return;
    }

    // ======================
    // PERHITUNGAN SAW
    // ======================
    if (page === "perhitungan") {
      container.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Hasil Perhitungan</h2>
            </div>
            <button id="run-saw-btn" class="mb-6 w-full bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl font-semibold text-lg transition-all duration-200 cetak-sembunyi">
                Mulai Perhitungan SAW
            </button>
            <div id="results-container" class="space-y-8">
                <p class="text-gray-600 dark:text-gray-400 text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    Klik tombol di atas untuk memulai proses perhitungan.
                </p>
            </div>
        `;
      document.getElementById("run-saw-btn").addEventListener("click", async () => {
        const resultsContainer = document.getElementById("results-container");
        const btn = document.getElementById("run-saw-btn");
        btn.disabled = true;
        btn.innerText = "Menghitung...";
        resultsContainer.innerHTML = `
                <div class="p-8 text-center text-indigo-600 dark:text-indigo-400 text-xl font-semibold bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    Sedang memproses perhitungan...
                </div>`;
        try {
          const res = await fetch(`${API_BASE_URL}/perhitungan/hitung`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Gagal mendapatkan hasil.");
          const kriteriaData = data.kriteriaData || [];
          const initialValues = data.initialValues || [];
          const normalizedValues = data.normalizedValues || [];
          const weightedNormalizedValues = data.weightedNormalizedValues || [];
          const ranking = data.ranking || [];
          const createTableHTML = (title, headers, rowsData, dataExtractor, rowClassCallback = null) => {
            const headerHTML = headers.map(h => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${h}</th>`).join('');
            const bodyHTML = rowsData.map((row, index) => {
              const rowClass = rowClassCallback ? rowClassCallback(row) : 'hover:bg-gray-50 dark:hover:bg-gray-700';
              const cellsHTML = headers.map(headerKey => `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${dataExtractor(row, headerKey, index)}</td>`).join('');
              return `<tr class="${rowClass}">${cellsHTML}</tr>`;
            }).join('');
            return `
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <h3 class="text-xl font-bold text-gray-800 dark:text-white p-5 border-b border-gray-200 dark:border-gray-700">${title}</h3>
                      <div class="overflow-x-auto">
                          <table class="min-w-full">
                              <thead class="bg-gray-50 dark:bg-gray-700"><tr>${headerHTML}</tr></thead>
                              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">${bodyHTML}</tbody>
                          </table>
                      </div>
                  </div>`;
          };
          const kriteriaHeaders = ["No", "Nama Alternatif", ...kriteriaData.map(k => `${k.nama} (${k.kode})`)];
          const kriteriaHeadersWithBobot = ['No', 'Nama Alternatif', ...kriteriaData.map(k => `${k.nama} (${k.kode}) (Bobot: ${k.bobot_normalisasi.toFixed(2)})`)];
          const initialExtractor = (row, headerKey, index) => {
            if (headerKey === "No") return index + 1;
            if (headerKey === "Nama Alternatif") return `<span class="font-medium text-gray-900 dark:text-white">${row.alternatif_nama}</span>`;
            const kriteriaCode = headerKey.substring(headerKey.indexOf("(") + 1, headerKey.indexOf(")"));
            return row[kriteriaCode]?.toFixed(3) ?? "N/A";
          };
          const normalizedExtractor = (row, headerKey, index) => {
            if (headerKey === "No") return index + 1;
            if (headerKey === "Nama Alternatif") return `<span class="font-medium text-gray-900 dark:text-white">${row.alternatif_nama}</span>`;
            const kriteriaCode = headerKey.substring(headerKey.indexOf("(") + 1, headerKey.indexOf(")"));
            return row[kriteriaCode]?.toFixed(3) ?? "N/A";
          };
          const weightedExtractor = (row, headerKey, index) => {
            if (headerKey === "No") return index + 1;
            if (headerKey === "Nama Alternatif") return `<span class="font-medium text-gray-900 dark:text-white">${row.alternatif_nama}</span>`;
            const kriteriaCode = headerKey.substring(headerKey.indexOf("(") + 1, headerKey.indexOf(")"));
            return row[kriteriaCode]?.toFixed(3) ?? "N/A";
          };
          const rankingHeaders = ["Ranking", "Nama Alternatif", "Skor Akhir (V)"];
          const rankingExtractor = (row, headerKey) => {
            if (headerKey === "Ranking") return `<span class="font-bold text-lg ${row.rank === 1 ? 'text-green-600' : 'text-gray-900 dark:text-white'}">${row.rank}</span>`;
            if (headerKey === "Nama Alternatif") return `<span class="font-medium text-gray-900 dark:text-white">${row.alternatif_nama}</span>`;
            if (headerKey === "Skor Akhir (V)") return `<span class="font-semibold text-gray-900 dark:text-white">${row.nilai.toFixed(4)}</span>`;
            return "N/A";
          };
          const rankingRowStyler = (row) => (row.rank === 1 ? 'bg-green-50 dark:bg-green-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700');
          const initialTableHTML = createTableHTML("Nilai Awal (X)", kriteriaHeaders, initialValues, initialExtractor);
          const normalizedTableHTML = createTableHTML("Nilai Normalisasi (R)", kriteriaHeadersWithBobot, normalizedValues, normalizedExtractor);
          const weightedTableHTML = createTableHTML("Nilai Normalisasi Terbobot (W * R)", kriteriaHeaders, weightedNormalizedValues, weightedExtractor);
          const rankingTableHTML = createTableHTML("Hasil Peringkat (V)", rankingHeaders, ranking, rankingExtractor, rankingRowStyler);
          const printButtonHTML = `
                <div class="mt-6 p-4 bg-green-600 rounded-lg shadow-lg text-center cursor-pointer hover:bg-green-700 transition-all duration-200 cetak-sembunyi" onclick="window.print()">
                    <button class="text-white font-bold text-lg"><i class="bi bi-printer-fill mr-2"></i>Cetak Hasil</button>
                </div>`;
          const graphHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-8 cetak-sembunyi">
                     <h3 class="text-xl font-bold text-gray-800 dark:text-white p-5 border-b border-gray-200 dark:border-gray-700">Grafik Nilai Terbobot</h3>
                     <div class="p-4" style="height: 400px;">
                         <canvas id="weightedChart"></canvas>
                     </div>
                </div>`;
          resultsContainer.innerHTML = initialTableHTML + normalizedTableHTML + weightedTableHTML + rankingTableHTML + printButtonHTML + graphHTML;
          renderWeightedChart(kriteriaData, weightedNormalizedValues);
        } catch (err) {
          console.error("Gagal menghitung SAW:", err);
          showToast(err.message, "error");
          resultsContainer.innerHTML = `<p class="text-red-600 p-4 bg-red-100 rounded-lg shadow-md font-semibold">Error: ${err.message}</p>`;
        } finally {
          btn.disabled = false;
          btn.innerText = "Mulai Perhitungan SAW";
        }
      });
      return;
    }

    // ======================
    // BACKUP DATABASE (SUPERADMIN)
    // ======================
    if (page === "backup-db") {
      if (user.role !== "superadmin") {
        container.innerHTML = '<p class="text-red-500 p-4 bg-red-100 rounded-lg shadow-md">Akses ditolak. Hanya superadmin.</p>';
        return;
      }
      container.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Backup Data</h2>
                <nav class="text-sm" aria-label="Breadcrumb">
                  <ol class="list-none p-0 inline-flex">
                    <li class="flex items-center"><span class="text-gray-500 dark:text-gray-400">Dashboard</span><i class="bi bi-chevron-right mx-2 text-gray-400"></i></li>
                    <li class="flex items-center"><span class="text-gray-700 dark:text-gray-200 font-semibold">Backup Data</span></li>
                  </ol>
                </nav>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                 <p class="text-gray-700 dark:text-gray-300 mb-2">*Untuk menjaga dari kerusakan data, data hilang dan hal-hal yang tidak diinginkan silahkan melakukan backup berkala.</p>
                 <p class="text-gray-700 dark:text-gray-300 mb-4">Untuk membackup data silahkan klik tombol dibawah.</p>
                 <button id="btn-create-backup" class="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 font-semibold transition-all duration-200 flex items-center justify-center">
                    <i class="bi bi-plus-lg mr-2"></i> Back Up Data
                </button>
            </div>
            <div id="backupTableContainer" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div class="p-4 flex justify-between items-center">
                     <div>
                        <label for="show-entries" class="text-sm text-gray-600 dark:text-gray-300">Tampil</label>
                        <select id="show-entries" class="border border-gray-300 dark:border-gray-600 rounded-md p-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <option value="10">10</option><option value="25">25</option><option value="50">50</option>
                        </select>
                        <span class="text-sm text-gray-600 dark:text-gray-300 ml-1">Data</span>
                     </div>
                     <div>
                        <label for="search-box" class="text-sm text-gray-600 dark:text-gray-300 mr-2">Pencarian:</label>
                        <input type="text" id="search-box" class="border border-gray-300 dark:border-gray-600 rounded-md p-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                     </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama File</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Waktu</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Opsi</th>
                            </tr>
                        </thead>
                        <tbody id="backup-table-body" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr><td colspan="5" class="p-4 text-center text-gray-500 dark:text-gray-400">Memuat data backup...</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="p-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                    <div id="table-info">Menampilkan 0 sampai 0 dari 0 data</div>
                    <div>
                        <button class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Sebelumnya</button>
                        <span id="page-numbers" class="px-3 py-1 text-blue-600 font-bold">1</span>
                        <button class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Selanjutnya</button>
                    </div>
                </div>
            </div>
        `;
      await loadBackupTable();
      document.getElementById("btn-create-backup").addEventListener("click", async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner mr-2"></span> Sedang memproses...';
        try {
          const res = await fetch(`${API_BASE_URL}/backup/database`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          showToast(result.message || 'Backup berhasil dibuat!');
          await loadBackupTable();
        } catch (err) {
          console.error('Gagal membuat backup:', err);
          showToast(`Error: ${err.message}`, 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-plus-lg mr-2"></i> Back Up Data';
        }
      });
      return;
    }

    // ======================
    // MANAJEMEN ADMIN
    // ======================
    if (page === "manajemen-admin") {
      if (user.role !== "superadmin") {
        container.innerHTML =
          '<p class="text-red-500 p-4 bg-red-100 rounded-lg shadow-md">Akses ditolak. Hanya superadmin.</p>';
        return;
      }
      container.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Admin</h2>
                <button id="btnAddAdmin" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 shadow-sm font-medium">
                  <i class="bi bi-plus-lg mr-1"></i> Tambah Admin
                </button>
            </div>
            <div id="adminTableContainer" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"></div>
            `;
      await loadAdminTable();
      async function loadAdminTable() {
        const tableContainer = document.getElementById("adminTableContainer");
        tableContainer.innerHTML = `<div class="p-4 text-center text-gray-500 dark:text-gray-400">Memuat data admin...</div>`;
        try {
          const res = await fetch(`${API_BASE_URL}/admin`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const admins = await res.json();
          if (!Array.isArray(admins)) throw new Error("Data admin tidak valid");

          const uniqueRoles = [...new Set(admins.map(a => a.role))];
          const roleOptions = uniqueRoles.map(role => ({
            value: role,
            label: role.charAt(0).toUpperCase() + role.slice(1)
          }));

          const rows = admins
            .map(
              (a) => `
                    <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${a.username}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${a.role}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                        <button onclick='showEditAdmin(${a.id},"${a.username}","${a.role}", ${JSON.stringify(roleOptions)})' class="px-3 py-1 text-xs font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition-colors">Edit</button>
                        <button onclick="deleteAdminClient(${a.id})" class="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors">Hapus</button>
                      </td>
                    </tr>`
            )
            .join("");
          tableContainer.innerHTML = `
                  <table class="min-w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">${rows}</tbody>
                  </table>
                `;
          document.getElementById("btnAddAdmin").onclick = () => showAddAdminModal(roleOptions);
        } catch (err) {
          showToast(`Gagal memuat data admin: ${err.message}`, 'error');
          tableContainer.innerHTML = `<p class="text-red-500 p-4">Gagal memuat data admin.</p>`;
        }
      }
      await loadAdminTable();
      return;
    }

    // ======================
    // PENJELASAN METODE  SAW
    // ======================
    else if (page === "penjelasan-saw") {
      if (mainHeader) {
        mainHeader.classList.add('shadow-md');
      }

      container.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                Penjelasan Metode SAW (Simple Additive Weighting)
            </h2>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                
                <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Apa itu SAW?</h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    Simple Additive Weighting (SAW) adalah salah satu metode Sistem Pendukung Keputusan (SPK)
                    yang menghitung nilai akhir alternatif berdasarkan penjumlahan terbobot dari setiap kriteria.
                    Metode ini banyak digunakan karena prosesnya sederhana, mudah dihitung, dan hasilnya jelas.
                </p>

                <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Tahapan Dalam Metode SAW</h3>

                <ol class="list-decimal pl-6 text-gray-600 dark:text-gray-300 space-y-3 mb-6">
                    <li>
                        <span class="font-medium">Menentukan kriteria dan bobotnya.</span>
                        Misalnya harga, kualitas, kecepatan, dan daya tahan, masing-masing memiliki bobot tertentu.
                    </li>
                    <li>
                        <span class="font-medium">Menentukan jenis kriteria (Benefit atau Cost).</span>
                        - Benefit: semakin besar nilai semakin baik  
                        - Cost: semakin kecil nilai semakin baik
                    </li>
                    <li>
                        <span class="font-medium">Membuat matriks keputusan.</span>
                        Berisi nilai setiap alternatif pada tiap kriteria.
                    </li>
                    <li>
                        <span class="font-medium">Normalisasi matriks keputusan.</span><br>
                        Rumus:
                        <div class="bg-gray-100 dark:bg-gray-700 text-center p-3 rounded-lg my-3 text-sm">
                            Benefit: Rij = Xij / Max(Xij) <br>
                            Cost: Rij = Min(Xij) / Xij
                        </div>
                    </li>
                    <li>
                        <span class="font-medium">Menghitung nilai akhir.</span><br>
                        Rumus:
                        <div class="bg-gray-100 dark:bg-gray-700 text-center p-3 rounded-lg my-3 text-sm">
                            Vi = Σ (Wi × Rij)
                        </div>
                        Dimana Wi adalah bobot kriteria.
                    </li>
                    <li>
                        <span class="font-medium">Menentukan peringkat alternatif.</span>
                        Alternatif dengan nilai terbesar adalah yang paling direkomendasikan.
                    </li>
                </ol>

                <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Contoh Singkat</h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Misalkan sebuah perusahaan ingin memilih supplier terbaik berdasarkan 3 kriteria:
                    Harga (Cost), Kualitas (Benefit), dan Kecepatan (Benefit).
                </p>

                <p class="text-gray-600 dark:text-gray-300 mt-4">
                    Setelah dinormalisasi dan dikalikan bobot, nilai supplier dihitung.
                    Supplier dengan nilai total tertinggi akan dipilih sebagai yang terbaik.
                </p>

                <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600 dark:border-blue-400 rounded-lg">
                    <p class="text-gray-800 dark:text-gray-200">
                        <strong>Kesimpulan:</strong>  
                        Metode SAW adalah teknik paling sederhana namun efektif untuk melakukan perangkingan pada
                        Sistem Pendukung Keputusan. Cocok untuk berbagai bidang seperti bisnis, akademik, dan industri.
                    </p>
                </div>

            </div>
        </div>
        `;

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


// ============================
// FUNGSI ADMIN (MENGGUNAKAN MODAL BARU)
// ============================
async function showAddAdminModal(roleOptions) {
  const options = roleOptions || [
    { value: "admin", label: "Admin" },
    { value: "superadmin", label: "Super Admin" }
  ];
  const result = await showPrompt({
    title: "Tambah Admin Baru",
    fields: [
      { id: "username", label: "Username Baru", required: true },
      { id: "password", label: "Password", type: "password", required: true },
      { id: "role", label: "Role", type: "select", value: "admin", required: true, options: options }
    ]
  });
  if (!result) return;
  try {
    const res = await fetch(`${API_BASE_URL}/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(result),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.message);
    showToast(j.message || "Berhasil");
    loadContent("manajemen-admin");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function showEditAdmin(id, username, role, roleOptions) {
  const options = roleOptions || [
    { value: "admin", label: "Admin" },
    { value: "superadmin", label: "Super Admin" }
  ];
  const result = await showPrompt({
    title: "Edit Admin",
    fields: [
      { id: "username", label: "Username", value: username, required: true },
      { id: "role", label: "Role", type: "select", value: role, required: true, options: options },
      { id: "password", label: "Password Baru (Opsional)", placeholder: "Kosongkan jika tidak diubah", type: "password" },
    ]
  });
  if (!result) return;
  const payload = { username: result.username, role: result.role };
  if (result.password) { payload.password = result.password; }
  try {
    const res = await fetch(`${API_BASE_URL}/admin/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.message);
    showToast(j.message || "Berhasil");
    loadContent("manajemen-admin");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteAdminClient(id) {
  const confirmed = await showConfirm("Hapus Admin", "Yakin ingin menghapus admin ini?");
  if (!confirmed) return;
  try {
    const res = await fetch(`${API_BASE_URL}/admin/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.message);
    showToast(j.message || "Berhasil");
    loadContent("manajemen-admin");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ============================
// FUNGSI KHUSUS BACKUP
// ============================
async function loadBackupTable() {
  const tableBody = document.getElementById("backup-table-body");
  const tableInfo = document.getElementById("table-info");
  if (!tableBody) return;
  tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500 dark:text-gray-400">Memuat data backup...</td></tr>`;
  try {
    const res = await fetch(`${API_BASE_URL}/backup`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const files = data.data || [];
    if (!files.length) {
      tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500 dark:text-gray-400">Belum ada file backup.</td></tr>`;
      tableInfo.innerText = "Menampilkan 0 sampai 0 dari 0 data";
      return;
    }
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
    tableInfo.innerText = `Menampilkan 1 sampai ${files.length} dari ${files.length} data`;
  } catch (err) {
    showToast(`Gagal memuat daftar backup: ${err.message}`, 'error');
    tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500">Gagal memuat data.</td></tr>`;
  }
}

function formatBackupDate(dateString) {
  const date = new Date(dateString);
  const optionsTanggal = { year: 'numeric', month: 'long', day: 'numeric' };
  const optionsWaktu = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  return {
    tanggal: date.toLocaleDateString('id-ID', optionsTanggal),
    waktu: date.toLocaleTimeString('id-ID', optionsWaktu).replace(/\./g, ':')
  };
}

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

    // AMBIL CONFIG AVATAR SAAT INI
    const config = getChatConfig();

    const wrapper = document.createElement('div');
    wrapper.className = "w-full max-w-3xl mx-auto flex gap-4 mb-6 animate-fade-in"; 
    if (elementId) wrapper.id = elementId;

    function simpleMarkdown(text) {
        if (!text) return "";
        let html = text
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>")
            .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-indigo-600 dark:text-indigo-400'>$1</strong>") 
            .replace(/`([^`]+)`/g, "<code class='bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm font-mono text-red-500'>$1</code>");
        return html;
    }

    if (sender === 'user') {
        // === TAMPILAN USER (KANAN) ===
        wrapper.classList.add('justify-end');

        // Cek Avatar User Custom
        let userAvatarHtml;
        if (config.userAvatar) {
            userAvatarHtml = `<img src="${config.userAvatar}" class="w-8 h-8 rounded-full object-cover shadow border border-white/20">`;
        } else {
            // Default Initials (U)
            userAvatarHtml = `
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow">
                    ${user.username.charAt(0).toUpperCase()}
                </div>`;
        }

        wrapper.innerHTML = `
            <div class="flex flex-col items-end max-w-[80%]">
                <div class="bg-indigo-600 text-white px-5 py-3 rounded-[20px] rounded-tr-sm shadow-md">
                    <p class="leading-relaxed whitespace-pre-wrap text-sm">${message}</p>
                </div>
            </div>
            ${userAvatarHtml} `;
    } else {
        // === TAMPILAN BOT (KIRI) ===
        wrapper.classList.add('justify-start');
        
        // Cek Avatar Bot Custom
        let botAvatarHtml;
        if (config.botAvatar) {
            botAvatarHtml = `<img src="${config.botAvatar}" class="w-8 h-8 rounded-full object-cover shadow border border-gray-200">`;
        } else {
            // Default Icon Robot
            botAvatarHtml = `
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-sm border border-white/10">
                    <i class="bi bi-robot"></i>
                </div>`;
        }

        let contentHtml = '';
        if (message === '...') {
            contentHtml = `
                <div class="flex space-x-1 h-6 items-center">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>`;
        } else {
            contentHtml = `<p class="leading-relaxed text-gray-800 dark:text-gray-100 text-sm">${simpleMarkdown(message)}</p>`;
        }

        wrapper.innerHTML = `
            ${botAvatarHtml} <div class="flex flex-col max-w-[85%]">
                <div class="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Asisten</div>
                <div class="px-1 py-1">
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
// MODAL SETTINGS (TAMPILAN TOKO)
// ==========================================
window.openSettingsModal = async () => {
    const modal = document.getElementById("modal-container");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.innerHTML = `<div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex items-center gap-3"><span class="spinner-border text-indigo-600"></span><span class="text-gray-600 dark:text-gray-300">Memuat pengaturan...</span></div>`;

    try {
        const res = await fetch(`${API_BASE_URL}/settings`);
        const data = await res.json();
        
        const appName = data.app_name || "Marhaban Parfume";
        // URL lengkap atau kosong
        const bgUrl = data.background_url || ""; 
        const logoUrl = data.logo_url || "";

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

                        <div class="relative bg-gray-900 rounded-xl overflow-hidden aspect-video shadow-inner border-4 border-gray-800">
                            <div id="previewBg" class="absolute inset-0 bg-cover bg-center transition-all duration-500" style="background-image: url('${bgUrl}'); background-color: #111827;">
                                <div class="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
                            </div>
                            
                            <div class="absolute inset-0 flex items-center justify-center p-4">
                                <div class="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-2xl w-48 text-center transform scale-90">
                                    <img id="previewLogoImg" src="${logoUrl}" class="${logoUrl ? '' : 'hidden'} h-8 mx-auto mb-2 object-contain">
                                    <div id="previewLogoIcon" class="${logoUrl ? 'hidden' : ''} w-8 h-8 mx-auto mb-2 rounded-full bg-indigo-600 flex items-center justify-center text-white"><i class="bi bi-shop"></i></div>
                                    
                                    <h4 id="previewTitle" class="font-bold text-gray-800 text-sm">${appName}</h4>
                                    <div class="mt-3 space-y-2 opacity-50">
                                        <div class="h-6 bg-gray-200 rounded w-full"></div>
                                        <div class="h-6 bg-gray-200 rounded w-full"></div>
                                        <div class="h-8 bg-indigo-600 rounded w-full mt-2"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded">Live Preview</div>
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

        // === LOGIKA INTERAKTIF ===
        const inpName = document.getElementById('confAppName');
        
        // Variabel Background
        const bgInput = document.getElementById('bgInput');
        const bgPreviewBox = document.getElementById('bgPreviewBox');
        const btnDeleteBg = document.getElementById('btnDeleteBg');
        const isDeleteBg = document.getElementById('isDeleteBg');
        const previewBg = document.getElementById('previewBg');

        // Variabel Logo
        const logoInput = document.getElementById('logoInput');
        const isDeleteLogo = document.getElementById('isDeleteLogo');
        const btnDeleteLogo = document.getElementById('btnDeleteLogo');
        const saveBtn = document.getElementById('btnSaveSettings');

        // 1. LOGIKA PREVIEW BACKGROUND
        bgInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Update Box di Form
                    bgPreviewBox.style.backgroundImage = `url('${e.target.result}')`;
                    bgPreviewBox.classList.remove('hidden');
                    // Update Live Preview Kanan
                    previewBg.style.backgroundImage = `url('${e.target.result}')`;
                    isDeleteBg.value = "false";
                }
                reader.readAsDataURL(file);
            }
        });

        btnDeleteBg.addEventListener('click', () => {
            if(confirm("Hapus gambar background dan kembali ke warna hitam?")) {
                bgPreviewBox.style.backgroundImage = '';
                bgPreviewBox.classList.add('hidden');
                previewBg.style.backgroundImage = ''; // Jadi hitam (default CSS)
                bgInput.value = "";
                isDeleteBg.value = "true";
            }
        });

        // 2. LOGIKA PREVIEW LOGO
        logoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
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

        btnDeleteLogo.addEventListener('click', () => {
            if(confirm("Hapus logo?")) {
                document.getElementById('logoPreview').src = "";
                document.getElementById('logoPreview').classList.add('hidden');
                document.getElementById('logoPlaceholder').classList.remove('hidden');
                document.getElementById('previewLogoImg').classList.add('hidden');
                document.getElementById('previewLogoIcon').classList.remove('hidden');
                btnDeleteLogo.classList.add('hidden');
                logoInput.value = "";
                isDeleteLogo.value = "true";
            }
        });

        // 3. LOGIKA PREVIEW NAMA
        inpName.addEventListener('input', () => {
            document.getElementById('previewTitle').innerText = inpName.value || "Nama Toko";
        });

        // 4. SIMPAN DATA (FORMDATA)
        saveBtn.addEventListener('click', async () => {
            saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm mr-2"></span> Menyimpan...`;
            saveBtn.disabled = true;

            const formData = new FormData();
            formData.append('app_name', inpName.value);
            formData.append('delete_logo', isDeleteLogo.value);
            formData.append('delete_background', isDeleteBg.value);

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