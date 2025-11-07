// ============================ file entry point (titik masuk)
// IMPORT MODULES
// ============================
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// ROUTES
const authRoutes = require('./app/routes/authRoutes');
const alternatifRoutes = require('./app/routes/AlternatifRoutes');
const kriteriaRoutes = require('./app/routes/KriteriaRoutes');
const subKriteriaRoutes = require('./app/routes/SubKriteriaRoutes');
const penilaianRoutes = require('./app/routes/PenilaianRoutes');
const perhitunganRoutes = require('./app/routes/PerhitunganRoutes');
const backupRoutes = require('./app/routes/backupRoutes');
const adminRoutes = require('./app/routes/adminRoutes');
const chatRoutes = require('./app/routes/chatRoutes');


// ============================
// KONFIGURASI DASAR SERVER
// ============================
dotenv.config();
const app = express();

// Middleware untuk parsing JSON
app.use(bodyParser.json());

// Middleware CORS agar frontend (index.html) bisa akses API backend
app.use(cors());

// Atur header agar API bisa diakses dari mana pun (terutama saat testing lokal)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// ============================
// ROUTE UTAMA APLIKASI
// ============================

// Otentikasi admin & super admin
app.use('/api/auth', authRoutes);

// Data utama untuk SPK SAW
app.use('/api/alternatif', alternatifRoutes);
app.use('/api/kriteria', kriteriaRoutes);
app.use('/api/subkriteria', subKriteriaRoutes);
app.use('/api/penilaian', penilaianRoutes);
app.use('/api/perhitungan', perhitunganRoutes);
app.use('/api/backup', backupRoutes);

// 🔐 Tambahan: Manajemen Admin (khusus super admin)
app.use('/api/admin', adminRoutes);

// 🤖 Tambahan: Rute untuk Chatbot AI
app.use('/api/chat', chatRoutes);


// ============================
// START SERVER
// ============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
    if (err) {
        console.error('❌ Gagal menjalankan server:', err);
        return;
    }
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});