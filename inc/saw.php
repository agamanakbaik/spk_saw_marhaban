<?php
require_once __DIR__ . '/config.php';


/**
* Proses SAW untuk 1 periode:
* - Ambil kriteria (bobot & tipe)
* - Ambil nilai untuk setiap kriteria di periode
* - Normalisasi
* - Hitung skor terbobot dan total
*/
function proses_saw($id_periode) {
global $pdo;
// ambil kriteria
$k = $pdo->query("SELECT * FROM kriteria ORDER BY id")->fetchAll();
if (!$k) return null;
// ambil nilai
$stmt = $pdo->prepare("SELECT n.id_kriteria, n.nilai FROM nilai n WHERE n.id_periode = :p");
$stmt->execute(['p'=>$id_periode]);
$nilai_rows = $stmt->fetchAll();
// mapping nilai per kriteria
$nilai_map = [];
foreach ($nilai_rows as $r) $nilai_map[$r['id_kriteria']] = floatval($r['nilai']);


// normalisasi
$normal = [];
foreach ($k as $krit) {
$idk = $krit['id'];
$type = $krit['tipe'];
// tentukan pembagi: untuk benefit -> max, cost -> min (gunakan formula berbeda)
// kita perlu semua nilai untuk kriteria ini across alternatives; tapi kita cuma punya 1 perusahaan per periode ->
// karena fokus menilai 1 perusahaan per periode, normalisasi kita lakukan relatif antar-kriteria:
// Gunakan pendekatan normalisasi sederhana: value / sqrt(sum(value^2)) -> vektor norm (umum dipakai SAW)
}


// Karena model kita menilai satu entitas (perusahaan) terhadap kriteria kuantitatif,
// kita akan normalisasi dengan cara menyesuaikan skala: buat matriks nilai raw -> normalisasi min-max antar kriteria bukan antar alternatif.
// Simplicity: normalisasi min-max but membutuhkan range; agar sederhana, kita ambil asumsi target ideal:


// Untuk implementasi yang sederhana dan konsisten, kita normalisasi berdasarkan bobot maksimal: ganti dengan normalisasi vektor.


// Buat vector norm denominator
$den = [];
foreach ($k as $krit) {
$idk = $krit['id'];
$val = isset($nilai_map[$idk]) ? $nilai_map[$idk] : 0;
$den[$idk] = ($den[$idk] ?? 0) + ($val * $val);
}
foreach ($den as $key => $v) $den[$key] = sqrt($v);


$skor_terbobot = 0.0;
foreach ($k as $krit) {
$idk = $krit['id'];
$val = isset($nilai_map[$idk]) ? $nilai_map[$idk] : 0;
$norm = $den[$idk] > 0 ? ($val / $den[$idk]) : 0;
// untuk cost, kita ubah norm = 1 - norm (membalik arah) — catatan: hanya works if scale consistent
if ($krit['tipe'] === 'cost') $norm = 1 - $norm;
$skor = $norm * floatval($krit['bobot']);
$skor_terbobot += $skor;
}


// Kategori (contoh threshold sederhana)
$kategori = 'Tidak Sehat';
if ($skor_terbobot >= 0.75) $kategori = 'Sehat';
elseif ($skor_terbobot >= 0.5) $kategori = 'Cukup Sehat';
else $kategori = 'Tidak Sehat';


// simpan hasil
$ins = $pdo->prepare("INSERT INTO hasil (id_periode, skor_total, kategori) VALUES (:p, :s, :k)");
$ins->execute(['p'=>$id_periode, 's'=>$skor_terbobot, 'k'=>$kategori]);


return ['skor'=>$skor_terbobot, 'kategori'=>$kategori];
}