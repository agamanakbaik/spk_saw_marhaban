// Kita ubah logikanya:

// Jika ada File Baru (req.file), update logo_url dengan path file baru.

// Jika ada perintah Hapus Logo (req.body.delete_logo), kosongkan logo_url.

// Jika tidak ada file, pakai data lama.

const Setting = require('../models/settingModel');

const settingController = {
    // 1. FUNGSI GET
    getBranding: async (req, res) => {
        try {
            const [rows] = await Setting.getSettings();
            
            if (rows.length > 0) {
                let data = rows[0];
                
                // Helper untuk format URL gambar agar lengkap (http://localhost...)
                const formatUrl = (filename) => {
                    if (!filename) return "";
                    if (filename.startsWith('http')) return filename;
                    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
                };

                data.logo_url = formatUrl(data.logo_url);
                data.background_url = formatUrl(data.background_url);

                res.json(data);
            } else {
                res.json({ 
                    app_name: "Marhaban Parfume", 
                    background_url: "", 
                    logo_url: "" 
                });
            }
        } catch (err) {
            console.error("Database Error:", err);
            res.status(500).json({ message: "Server Error" });
        }
    },

    // 2. FUNGSI PUT (UPDATE)
    updateBranding: async (req, res) => {
        try {
            const [rows] = await Setting.getSettings();
            const currentSettings = rows[0] || {};
            const { app_name, delete_logo, delete_background } = req.body;
            
            let newLogoUrl = currentSettings.logo_url;
            let newBgUrl = currentSettings.background_url;

            // Cek Upload Logo
            if (req.files && req.files['logo']) {
                newLogoUrl = req.files['logo'][0].filename;
            } else if (delete_logo === 'true') {
                newLogoUrl = "";
            }

            // Cek Upload Background
            if (req.files && req.files['background']) {
                newBgUrl = req.files['background'][0].filename;
            } else if (delete_background === 'true') {
                newBgUrl = "";
            }

            const data = {
                app_name: app_name || currentSettings.app_name,
                background_url: newBgUrl,
                logo_url: newLogoUrl
            };

            await Setting.updateSettings(data);
            
            // Format URL untuk respon balik
            const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
            
            res.json({ 
                message: "Berhasil update tampilan!",
                logo_url: newLogoUrl ? baseUrl + newLogoUrl : "",
                background_url: newBgUrl ? baseUrl + newBgUrl : ""
            });

        } catch (err) {
            console.error("Update Error:", err);
            res.status(500).json({ message: "Gagal update." });
        }
    }
};

// [PENTING] Pastikan baris ini ada!
module.exports = settingController;