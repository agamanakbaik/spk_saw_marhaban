// Import modules
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
// KOREKSI PATH: Mengarah ke ./app/routes/authRoutes
const authRoutes = require('./app/routes/authRoutes');
const app = express();
const alternatifRoutes = require('./app/routes/AlternatifRoutes');

// Load environment variables from .env file
dotenv.config();

// Middleware: Menggunakan body-parser untuk memproses data JSON
app.use(bodyParser.json());

// Middleware: Mengizinkan request dari domain lain (CORS)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// =================================
// ROUTE UTAMA APLIKASI
// =================================

// 1. Rute Otentikasi (Login/Admin)
app.use('/api/auth', authRoutes);
app.use('/api/alternatif', alternatifRoutes);

// =================================
// START SERVER
// =================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
    if (err) {
        console.error('Error starting server:', err);
        return;
    }
    console.log(`Server is running on http://localhost:${PORT}`);
});