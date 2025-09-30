// File: spk-saw-backend/config/db.js

const mysql = require('mysql2');
const dotenv = require('dotenv');

// Memuat variabel lingkungan dari .env
dotenv.config();

// Membuat pool koneksi. Pool mengelola beberapa koneksi sekaligus, 
// yang lebih efisien untuk aplikasi web yang menerima banyak request.
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Sesuaikan dengan password Anda
    database: process.env.DB_NAME || 'spk_saw_db',
    port: process.env.DB_PORT || 3306,

    // Konfigurasi Pool
    waitForConnections: true, // Tunggu jika semua koneksi sedang digunakan
    connectionLimit: 10, // Batas maksimum koneksi yang diizinkan
    queueLimit: 0 // Tanpa batas antrian
});

// Mengubah pool menjadi Promise-based API. Ini memungkinkan penggunaan async/await
// yang membuat kode lebih bersih daripada menggunakan callback.
const promisePool = pool.promise();

// Cek Koneksi (Opsional, tapi disarankan untuk debugging)
promisePool.getConnection()
    .then(connection => {
        console.log("Database: Koneksi ke MySQL Sukses! (Pool Ready)");
        connection.release(); // Lepaskan koneksi yang digunakan untuk cek
    })
    .catch(err => {
        console.error("Database: Koneksi ke MySQL GAGAL. Periksa .env dan server MySQL Anda.", err.message);
        // Anda bisa memilih untuk keluar dari aplikasi jika koneksi sangat penting:
        // process.exit(1); 
    });

module.exports = promisePool;