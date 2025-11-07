// app/controllers/backupController.js
// HAPUS SEMUA require('fs'), ('path'), ('child_process'), ('dotenv')
// TAMBAHKAN:
const BackupModel = require('../models/backupModel');

// 1. Controller untuk MEMBUAT backup
exports.createBackup = async (req, res) => {
    try {
        // Panggil Model, yang mengembalikan nama file jika sukses
        const backupFileName = await BackupModel.create();
        
        res.status(201).json({ 
            message: `Backup ${backupFileName} berhasil dibuat.`, 
            filename: backupFileName 
        });
    } catch (err) {
        console.error('createBackup Controller Error:', err.message);
        // Kirim 500 jika error-nya adalah Error server
        res.status(500).json({ message: err.message });
    }
};

// 2. Controller untuk MENAMPILKAN DAFTAR backup
exports.listBackups = async (req, res) => {
    try {
        const fileDetails = await BackupModel.findAll();
        res.status(200).json({ data: fileDetails }); // Model sudah mengurus array kosong
    } catch (err) {
        console.error('listBackups Controller Error:', err.message);
        res.status(500).json({ message: 'Gagal membaca daftar backup.' });
    }
};

// 3. Controller untuk MENGUNDUH backup
exports.downloadBackup = async (req, res) => {
    try {
        const filename = req.params.filename;
        const { filePath } = await BackupModel.getFileDetails(filename);

        // Controller tetap yang memanggil 'res.download'
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
        });
    } catch (err) {
        console.error('downloadBackup Controller Error:', err.message);
        if (err.message === 'Nama file tidak valid.') {
            return res.status(400).json({ message: err.message });
        }
        if (err.message === 'File tidak ditemukan.') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: 'Gagal mengunduh file.' });
    }
};

// 4. Controller untuk MENGHAPUS backup
exports.deleteBackup = async (req, res) => {
    try {
        const filename = req.params.filename;
        await BackupModel.delete(filename);
        
        res.status(200).json({ message: `File ${filename} berhasil dihapus.` });
    } catch (err) {
        console.error('deleteBackup Controller Error:', err.message);
        if (err.message === 'Nama file tidak valid.') {
            return res.status(400).json({ message: err.message });
        }
        if (err.message === 'File tidak ditemukan.') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: 'Gagal menghapus file di server.' });
    }
};