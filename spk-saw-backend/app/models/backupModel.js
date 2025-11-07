// app/models/backupModel.js
const { exec } = require('child_process');
const fs = require('fs').promises; // Menggunakan versi promise
const path = require('path');

// Tentukan path ke folder backups di root backend
const backupDir = path.join(__dirname, '..', '..', 'backups');

// Helper internal untuk memastikan folder ada
const ensureBackupDirExists = async () => {
    try {
        await fs.access(backupDir); // Cek apakah bisa diakses
    } catch (error) {
        // Jika tidak ada, buat folder
        if (error.code === 'ENOENT') {
            try {
                await fs.mkdir(backupDir);
            } catch (dirError) {
                console.error('Gagal membuat folder backup:', dirError);
                throw new Error('Gagal membuat folder backup di server.');
            }
        } else {
            throw error; // Error lain (misal: izin)
        }
    }
};

const BackupModel = {};

// 1. Logika untuk MEMBUAT backup
BackupModel.create = () => {
    // Kita bungkus 'exec' (yang berbasis callback) di dalam Promise
    return new Promise(async (resolve, reject) => {
        await ensureBackupDirExists();

        const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

        if (!DB_HOST || !DB_USER || !DB_NAME) {
            return reject(new Error('Konfigurasi database .env tidak lengkap.'));
        }

        const backupFileName = `db-backup-${DB_NAME}-${Date.now()}.sql`;
        const backupFilePath = path.join(backupDir, backupFileName);
        
        const command = `mysqldump --host=${DB_HOST} --user=${DB_USER} --password=${DB_PASSWORD} ${DB_NAME} > "${backupFilePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing mysqldump: ${error.message}`);
                // Error spesifik jika mysqldump tidak ada di path
                if (error.message.includes('not recognized') || error.message.includes('command not found')) {
                    return reject(new Error('Error: "mysqldump" tidak ditemukan di server backend.'));
                }
                return reject(new Error(`Gagal membuat backup: ${error.message}`));
            }
            console.log('Backup berhasil dibuat (Model):', backupFileName);
            resolve(backupFileName); // Berhasil, kirim nama file-nya
        });
    });
};

// 2. Logika untuk MENAMPILKAN DAFTAR backup
BackupModel.findAll = async () => {
    await ensureBackupDirExists();

    const files = await fs.readdir(backupDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql'));

    if (sqlFiles.length === 0) {
        return []; // Kembalikan array kosong
    }

    const fileDetailsPromises = sqlFiles.map(async (file) => {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        return {
            name: file,
            time: stats.birthtime, // Waktu pembuatan file
            size: stats.size
        };
    });

    const fileDetails = await Promise.all(fileDetailsPromises);
    // Urutkan dari yang terbaru (paling atas)
    fileDetails.sort((a, b) => b.time.getTime() - a.time.getTime());
    return fileDetails;
};

// 3. Logika untuk MENDAPATKAN DETAIL FILE (Download/Delete)
BackupModel.getFileDetails = async (filename) => {
    // Security check
    if (filename.includes('..') || !filename.endsWith('.sql')) {
        throw new Error('Nama file tidak valid.'); // Error 400
    }

    const filePath = path.join(backupDir, filename);

    try {
        await fs.access(filePath); // Cek file
        return { filePath, filename }; // Kembalikan path jika ada
    } catch (error) {
        throw new Error('File tidak ditemukan.'); // Error 404
    }
};

// 4. Logika untuk MENGHAPUS backup
BackupModel.delete = async (filename) => {
    // getFileDetails sudah termasuk security check
    const { filePath } = await BackupModel.getFileDetails(filename);
    
    await fs.unlink(filePath);
    console.log('File backup dihapus (Model):', filename);
    // Tidak perlu mengembalikan apa-apa, sukses berarti selesai
};

module.exports = BackupModel;