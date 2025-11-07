// ============================
// KONFIGURASI DASAR FRONTEND
// ============================
const API_BASE_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");
console.log("Token FE:", token);
const user = JSON.parse(localStorage.getItem("user") || "null");

let myWeightedChart = null; // Variabel global untuk chart di 'Hasil Perhitungan'
let myDashboardChart = null; // Variabel global untuk chart di 'Dashboard'

// Jika belum login, redirect
if (!token) {
  alert("Sesi Anda berakhir. Silakan login ulang.");
  window.location.href = "login.html";
  throw new Error("Not authenticated");
}

// Tampilkan nama user
document.getElementById("userNameDisplay").textContent = user.username;

// Sembunyikan menu superadmin jika bukan superadmin
if (user.role !== "superadmin") {
  const adminMenu = document.getElementById("menu-manajemen-admin");
  if (adminMenu) adminMenu.style.display = "none";

  const backupMenu = document.getElementById("menu-backup-db");
  if (backupMenu) backupMenu.style.display = "none";
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
    // DATA ALTERNATIF
    // ======================
    if (page === "alternatif") {
      container.innerHTML = `
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Data Alternatif</h2>
              <button id="btnAddAlt" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm font-medium">
                <i class="bi bi-plus-lg mr-1"></i> Tambah Alternatif
              </button>
            </div>
            <div id="altTable" class="overflow-x-auto"></div>
            `;
      const tableContainer = document.getElementById("altTable");
      const btnAdd = document.getElementById("btnAddAlt");
      await loadAlternatifTable();
      btnAdd.addEventListener("click", () => showAltModal());
      async function loadAlternatifTable() {
        try {
          const res = await fetch(`${API_BASE_URL}/alternatif`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          const alternatifs = (data.data || data || []).sort((a, b) => a.id - b.id);
          if (!alternatifs.length) {
            tableContainer.innerHTML = `<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-gray-500 dark:text-gray-400 text-center">Belum ada data alternatif.</div>`;
            return;
          }
          const rows = alternatifs.map((a) => `
                    <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${a.kode_alternatif}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${a.nama_periode}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${a.deskripsi || "-"}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                        <button class="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-md hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800 transition-colors" onclick='editAlt(${JSON.stringify(a)})'>Edit</button>
                        <button class="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors" onclick='deleteAlt(${a.id})'>Hapus</button>
                      </td>
                    </tr>
                  `).join("");
          tableContainer.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <table class="min-w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kode</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Periode</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deskripsi</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">${rows}</tbody>
                  </table>
                </div>
              `;
        } catch (err) {
          console.error(err);
          tableContainer.innerHTML = `<p class="text-red-500">Gagal memuat data alternatif.</p>`;
        }
      }
      window.showAltModal = (data = {}) => {
        const modal = document.getElementById("modal-container");
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        modal.innerHTML = `
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-auto transform transition-all duration-300 scale-100">
                  <div class="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
                      <h3 class="text-xl font-semibold text-gray-800 dark:text-white">${data.id ? "Edit" : "Tambah"} Alternatif</h3>
                      <button onclick="closeAltModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white text-3xl leading-none">&times;</button>
                  </div>
                  <form id="altForm">
                      <div class="p-6 space-y-4">
                          <input type="hidden" id="altId" value="${data.id || ""}">
                          <div>
                              <label for="kodeAlt" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Kode Alternatif</label>
                              <input type="text" id="kodeAlt" value="${data.kode_alternatif || ""}" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required>
                          </div>
                          <div>
                              <label for="namaAlt" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Periode</label>
                              <input type="text" id="namaAlt" value="${data.nama_periode || ""}" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required>
                          </div>
                          <div>
                              <label for="descAlt" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                              <textarea id="descAlt" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">${data.deskripsi || ""}</textarea>
                          </div>
                      </div>
                      <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                          <button type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition" onclick="closeAltModal()">Batal</button>
                          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">Simpan</button>
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
            headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
            body: JSON.stringify(payload),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          showToast(result.message || "Berhasil disimpan!");
          closeAltModal();
          await loadAlternatifTable();
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
          await loadAlternatifTable();
        } catch (err) {
          console.error(err);
          showToast(`Gagal menghapus data: ${err.message}`, "error");
        }
      };
      return;
    }

    /// ======================
    /// DATA KRITERIA
    /// ======================
    if (page === "kriteria") {
      container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h2 id="pageTitle" class="text-2xl font-bold text-gray-800 dark:text-white">Data Kriteria</h2>
          <button id="btnAddKrit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm font-medium">
            <i class="bi bi-plus-lg mr-1"></i> Tambah Kriteria
          </button>
        </div>
        <div id="kritTable" class="overflow-x-auto"></div>
      `;
      const tableContainer = document.getElementById("kritTable");
      const btnAdd = document.getElementById("btnAddKrit");
      const pageTitle = document.getElementById("pageTitle");
      window.currentKriteriaId = null;
      window.loadKriteriaTable = async function () {
        pageTitle.innerText = "Data Kriteria";
        try {
          const res = await fetch(`${API_BASE_URL}/kriteria`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          const kriterias = (Array.isArray(data) ? data : data.data || []).sort((a,b) => a.id - b.id);
          if (!kriterias.length) {
            tableContainer.innerHTML = `<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-gray-500 dark:text-gray-400 text-center">Belum ada data kriteria.</div>`;
            return;
          }
          const rows = kriterias
            .map(
              (k) => `
                <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${k.kode}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${k.nama}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${parseFloat(k.bobot)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${k.tipe.toLowerCase() === 'benefit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                      ${k.tipe}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                    <button class="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                      onclick='openSubKriteria(${k.id}, "${k.nama}")'>Sub Kriteria</button>
                    <button class="px-3 py-1 text-xs font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition-colors"
                      onclick='showKritModal(${JSON.stringify(k)})'>Edit</button>
                    <button class="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                      onclick='deleteKrit(${k.id})'>Hapus</button>
                  </td>
                </tr>
              `
            )
            .join("");
          tableContainer.innerHTML = `
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <table class="min-w-full">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kode</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Kriteria</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bobot</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipe</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">${rows}</tbody>
                </table>
              </div>
              `;
        } catch (err) {
          console.error(err);
          tableContainer.innerHTML = `<p class="text-red-500">Gagal memuat data kriteria.</p>`;
        }
      };
      window.openSubKriteria = async function (id, namaKriteria) {
        window.currentKriteriaId = id;
        const kriteriaId = id;
        tableContainer.innerHTML = `<div class="p-4 text-center text-indigo-500 dark:text-indigo-400">Memuat sub kriteria...</div>`;
        pageTitle.innerText = `Sub Kriteria - ${namaKriteria}`;
        try {
          const res = await fetch(
            `${API_BASE_URL}/subkriteria?kriteria_id=${kriteriaId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Gagal memuat sub kriteria.");
          }
          const data = await res.json();
          const subkrits = (Array.isArray(data) ? data : data.data || []).sort((a,b) => a.id - b.id);
          const rows = subkrits.length ?
            subkrits
            .map(
              (s, i) => `
                <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${i + 1}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${s.nama}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${s.nilai}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${s.keterangan || '-'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                    <button class="px-3 py-1 text-xs font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition-colors"
                      onclick='showSubKritModal(${JSON.stringify({ ...s, kriteria_id: kriteriaId })})'>Edit</button>
                    <button class="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                      onclick='deleteSubKrit(${s.id}, ${kriteriaId})'>Hapus</button>
                  </td>
                </tr>
                `
            )
            .join("") :
            `<tr><td colspan="5" class="text-center text-gray-500 dark:text-gray-400 py-4">Belum ada sub kriteria.</td></tr>`;
          tableContainer.innerHTML = `
                <div class="mb-4 flex items-center space-x-2 cetak-sembunyi">
                  <button class="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 text-sm transition" onclick="loadKriteriaTable()">
                    <i class="bi bi-arrow-left mr-1"></i> Kembali
                  </button>
                  <button class="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm transition"
                    onclick='showSubKritModal({ kriteria_id: ${kriteriaId} })'>
                    <i class="bi bi-plus-lg mr-1"></i> Tambah Sub Kriteria
                  </button>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <table class="min-w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sub Kriteria</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nilai</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Keterangan</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">${rows}</tbody>
                  </table>
                </div>
              `;
        } catch (err) {
          console.error(err);
          tableContainer.innerHTML = `<p class="text-red-500">Gagal memuat sub kriteria: ${err.message || "Periksa konsol."}</p>`;
        }
      };
      window.showSubKritModal = (data = {}) => {
        const modal = document.getElementById("modal-container");
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        const title = data.id ? "Edit Sub Kriteria" : "Tambah Sub Kriteria";
        const kriteriaId = data.kriteria_id || window.currentKriteriaId;
        if (!kriteriaId) {
          showToast("Error: ID Kriteria tidak ditemukan.", "error");
          closeSubKritModal();
          return;
        }
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-auto transform transition-all duration-300 scale-100">
                <div class="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-white">${title}</h3>
                    <button onclick="closeSubKritModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <form id="subKritForm">
                    <div class="p-6 space-y-4">
                        <input type="hidden" id="subKritId" value="${data.id || ""}">
                        <input type="hidden" id="kriteriaIdInput" value="${kriteriaId}">
                        <div>
                            <label for="namaSubKrit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Sub Kriteria</label>
                            <input type="text" id="namaSubKrit" value="${data.nama || ""}" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required>
                        </div>
                        <div>
                            <label for="keteranganSubKrit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Keterangan (Opsional)</label>
                            <textarea id="keteranganSubKrit" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" rows="3">${data.keterangan || ""}</textarea>
                        </div>
                        <div>
                            <label for="nilaiSubKrit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nilai</label>
                            <input type="number" id="nilaiSubKrit" value="${data.nilai || ""}" step="1" min="1" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required>
                        </div>
                    </div>
                    <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                        <button type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition" onclick="closeSubKritModal()">Batal</button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">Simpan</button>
                    </div>
                </form>
            </div>
            `;
        document.getElementById("subKritForm").addEventListener("submit", saveSubKrit);
      };
      window.closeSubKritModal = () => {
        document.getElementById("modal-container").classList.add("hidden");
        document.getElementById("modal-container").innerHTML = "";
      };
      async function saveSubKrit(e) {
        e.preventDefault();
        const id = document.getElementById("subKritId").value;
        const kriteria_id = document.getElementById("kriteriaIdInput").value;
        const payload = {
          kriteria_id: parseInt(kriteria_id),
          nama: document.getElementById("namaSubKrit").value,
          nilai: parseInt(document.getElementById("nilaiSubKrit").value),
          keterangan: document.getElementById("keteranganSubKrit").value || null
        };
        const url = id ? `${API_BASE_URL}/subkriteria/${id}` : `${API_BASE_URL}/subkriteria`;
        const method = id ? "PUT" : "POST";
        const pageTitleText = document.getElementById("pageTitle").innerText;
        const namaKriteria = pageTitleText.replace("Sub Kriteria - ", "");
        try {
          const res = await fetch(url, {
            method,
            headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
            body: JSON.stringify(payload),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          showToast(result.message || "Sub Kriteria berhasil disimpan!");
          closeSubKritModal();
          await openSubKriteria(kriteria_id, namaKriteria);
        } catch (err) {
          console.error(err);
          showToast(`Terjadi kesalahan: ${err.message}`, "error");
        }
      }
      window.deleteSubKrit = async (id, kriteria_id) => {
        const confirmed = await showConfirm("Hapus Data", "Yakin hapus sub kriteria ini?");
        if (confirmed) {
          const pageTitleText = document.getElementById("pageTitle").innerText;
          const namaKriteria = pageTitleText.replace("Sub Kriteria - ", "");
          try {
            const res = await fetch(`${API_BASE_URL}/subkriteria/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            showToast(result.message || "Sub Kriteria berhasil dihapus!");
            await openSubKriteria(kriteria_id, namaKriteria);
          } catch (err) {
            console.error(err);
            showToast(`Gagal menghapus data: ${err.message}`, "error");
          }
        }
      };
      window.editKrit = (data) => showKritModal(data);
      window.deleteKrit = async (id) => {
        const confirmed = await showConfirm("Hapus Kriteria", "Yakin ingin menghapus kriteria ini? Semua sub-kriteria yang terkait akan ikut terhapus.");
        if (!confirmed) return;
        try {
          const res = await fetch(`${API_BASE_URL}/kriteria/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          showToast(result.message || "Data berhasil dihapus!");
          await loadKriteriaTable();
        } catch (err) {
          console.error(err);
          showToast(`Gagal menghapus data: ${err.message}`, "error");
        }
      };
      window.showKritModal = (data = {}) => {
        const modal = document.getElementById("modal-container");
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-auto transform transition-all duration-300 scale-100">
                <div class="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-white">${data.id ? "Edit" : "Tambah"} Kriteria</h3>
                    <button onclick="closeKritModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <form id="kritForm">
                    <div class="p-6 space-y-4">
                        <input type="hidden" id="kritId" value="${data.id || ""}">
                        <div>
                            <label for="kodeKrit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Kode Kriteria</label>
                            <input type="text" id="kodeKrit" value="${data.kode || ""}" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required>
                        </div>
                        <div>
                            <label for="namaKrit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kriteria</label>
                            <input type="text" id="namaKrit" value="${data.nama || ""}" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required>
                        </div>
                        <div>
                            <label for="bobotKrit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Bobot</label>
                            <input type="number" id="bobotKrit" value="${parseFloat(data.bobot) || ""}" step="0.01" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" required>
                        </div>
                        <div>
                            <label for="tipeKrit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipe</label>
                            <select id="tipeKrit" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="Benefit" ${data.tipe === "Benefit" ? "selected" : ""}>Benefit</option>
                                <option value="Cost" ${data.tipe === "Cost" ? "selected" : ""}>Cost</option>
                            </select>
                        </div>
                    </div>
                    <div class="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                        <button type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition" onclick="closeKritModal()">Batal</button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">Simpan</button>
                    </div>
                </form>
            </div>
            `;
        document.getElementById("kritForm").addEventListener("submit", saveKrit);
      };
      window.closeKritModal = () => {
        document.getElementById("modal-container").classList.add("hidden");
        document.getElementById("modal-container").innerHTML = "";
      };
      async function saveKrit(e) {
        e.preventDefault();
        const id = document.getElementById("kritId").value;
        const payload = {
          kode: document.getElementById("kodeKrit").value,
          nama: document.getElementById("namaKrit").value,
          bobot: document.getElementById("bobotKrit").value,
          tipe: document.getElementById("tipeKrit").value,
        };
        const url = id ? `${API_BASE_URL}/kriteria/${id}` : `${API_BASE_URL}/kriteria`;
        const method = id ? "PUT" : "POST";
        try {
          const res = await fetch(url, {
            method,
            headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
            body: JSON.stringify(payload),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          showToast(result.message || "Berhasil disimpan!");
          closeKritModal();
          await loadKriteriaTable();
        } catch (err) {
          console.error(err);
          showToast(`Terjadi kesalahan: ${err.message}`, "error");
        }
      }
      await loadKriteriaTable();
      btnAdd.addEventListener("click", () => showKritModal());
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
                          <span class="text-gray-500 dark:text-gray-400">Dashboard</span> <svg class="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
                        </li>
                        <li class="flex items-center">
                          <span class="text-gray-700 dark:text-gray-200 font-semibold">Nilai Alternatif</span>
                        </li>
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
              headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
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
      headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
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
      headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
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
                        callback: function(value, index, values) {
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
// FUNGSI CHATBOT (AI)
// ============================
async function handleChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    addMessageToChat(message, 'user');
    input.value = '';

    // Tampilkan 'typing'...
    const typingIndicator = addMessageToChat('...', 'bot');
    
    try {
        // Kirim pesan ke backend AI
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
        // Hapus 'typing' dan ganti dengan jawaban AI
        typingIndicator.remove();
        addMessageToChat(data.reply, 'bot');

    } catch (err) {
        console.error("Error chat AI:", err);
        // Hapus 'typing' dan ganti dengan pesan error
        typingIndicator.remove();
        addMessageToChat(`Maaf, terjadi kesalahan: ${err.message}`, 'bot');
    }
}

// Fungsi untuk menambahkan pesan ke UI chat
function addMessageToChat(message, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    if (sender === 'user') {
        messageDiv.className = 'chat-message-user flex justify-end';
        messageDiv.innerHTML = `
            <div class="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                <p>${message}</p>
            </div>
        `;
    } else {
        messageDiv.className = 'chat-message-bot flex';
        messageDiv.innerHTML = `
            <div class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-lg max-w-xs">
                <p>${message}</p>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    // Scroll otomatis ke bawah
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageDiv; // Kembalikan elemen untuk dihapus (jika 'typing')
}


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