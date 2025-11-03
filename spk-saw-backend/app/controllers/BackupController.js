const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
// Pastikan .env dimuat dari root folder backend
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') }); 

// Tentukan path ke folder backups di root backend
const backupDir = path.join(__dirname, '..', '..', 'backups');

// Helper untuk memastikan folder 'backups' ada
const ensureBackupDirExists = () => {
    if (!fs.existsSync(backupDir)) {
        try {
            fs.mkdirSync(backupDir);
        } catch (dirError) {
            console.error('Gagal membuat folder backup:', dirError);
            throw new Error('Gagal membuat folder backup di server.');
        }
    }
};

// 1. Controller untuk MEMBUAT backup
exports.createBackup = (req, res) => {
    ensureBackupDirExists();

    // ▼▼▼ PERUBAHAN DI SINI ▼▼▼
    // Membaca DB_NAME dari .env Anda, bukan DB_DATABASE
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

    // Validasi menggunakan DB_NAME
    if (!DB_HOST || !DB_USER || !DB_NAME) {
    // ▲▲▲ AKHIR PERUBAHAN ▲▲▲
        return res.status(500).json({ message: 'Konfigurasi database .env tidak lengkap.' });
    }

    const backupFileName = `db-backup-${DB_NAME}-${Date.now()}.sql`; // Menggunakan DB_NAME di nama file
    const backupFilePath = path.join(backupDir, backupFileName); 

    // Ganti 'mysqldump' dengan path lengkap jika tidak ada di PATH server Anda
    // Contoh untuk XAMPP: "C:\\xampp\\mysql\\bin\\mysqldump.exe"
    
    // ▼▼▼ PERUBAHAN DI SINI ▼▼▼
    // Menggunakan ${DB_NAME} di dalam perintah
    const command = `mysqldump --host=${DB_HOST} --user=${DB_USER} --password=${DB_PASSWORD} ${DB_NAME} > "${backupFilePath}"`;
    // ▲▲▲ AKHIR PERUBAHAN ▲▲▲
    
    console.log('Menjalankan perintah backup...');
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing mysqldump: ${error.message}`);
            if (error.message.includes('not recognized') || error.message.includes('command not found')) {
                 return res.status(500).json({ message: 'Error: "mysqldump" tidak ditemukan di server backend.' });
            }
            return res.status(500).json({ message: 'Gagal membuat backup.', error: error.message });
        }
        
        console.log('Backup berhasil dibuat:', backupFileName);
        res.status(201).json({ message: `Backup ${backupFileName} berhasil dibuat.`, filename: backupFileName });
    });
};

// 2. Controller untuk MENAMPILKAN DAFTAR backup
exports.listBackups = (req, res) => {
    ensureBackupDirExists();

    fs.readdir(backupDir, (err, files) => {
        if (err) {
            console.error('Gagal membaca folder backup:', err);
            return res.status(500).json({ message: 'Gagal membaca daftar backup.' });
        }

        // Filter hanya file .sql dan ambil statistiknya
        const sqlFiles = files.filter(file => file.endsWith('.sql'));
        
        if (sqlFiles.length === 0) {
            return res.status(200).json({ data: [] });
        }

        const fileDetailsPromises = sqlFiles.map(file => {
            return new Promise((resolve, reject) => {
                const filePath = path.join(backupDir, file);
                fs.stat(filePath, (statErr, stats) => {
                    if (statErr) {
                        return reject(statErr);
                    }
                    resolve({
                        name: file,
                        time: stats.birthtime, // Waktu pembuatan file
                        size: stats.size
                    });
                });
            });
        });

        Promise.all(fileDetailsPromises)
            .then(fileDetails => {
                // Urutkan dari yang terbaru (paling atas)
                fileDetails.sort((a, b) => b.time.getTime() - a.time.getTime());
                res.status(200).json({ data: fileDetails });
            })
            .catch(statErr => {
                console.error('Gagal mendapatkan stat file:', statErr);
                res.status(500).json({ message: 'Gagal membaca detail file backup.' });
            });
    });
};

// 3. Controller untuk MENGUNDUH backup
exports.downloadBackup = (req, res) => {
    const filename = req.params.filename;
    
    // Security check: Pastikan tidak ada directory traversal
    if (filename.includes('..') || !filename.endsWith('.sql')) {
        return res.status(400).json({ message: 'Nama file tidak valid.' });
    }

    const filePath = path.join(backupDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File tidak ditemukan.' });
    }

    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('Error sending file:', err);
        }
    });
};

// 4. Controller untuk MENGHAPUS backup
exports.deleteBackup = (req, res) => {
    const filename = req.params.filename;

    // Security check
    if (filename.includes('..') || !filename.endsWith('.sql')) {
        return res.status(400).json({ message: 'Nama file tidak valid.' });
    }

    const filePath = path.join(backupDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File tidak ditemukan.' });
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Gagal menghapus file:', err);
            return res.status(500).json({ message: 'Gagal menghapus file di server.' });
        }
        
        console.log('File backup dihapus:', filename);
        res.status(200).json({ message: `File ${filename} berhasil dihapus.` });
    });
};