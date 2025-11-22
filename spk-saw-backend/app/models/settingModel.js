const db = require('../../config/db');

const Setting = {
    // Menggunakan async/await
    getSettings: async () => {
        // db.query dengan promise mengembalikan array [rows, fields]
        // Kita kembalikan promise-nya langsung
        return db.query("SELECT app_name, background_url, logo_url FROM settings WHERE id = 1");
    },

    updateSettings: async (data) => {
        const query = "UPDATE settings SET app_name = ?, background_url = ?, logo_url = ? WHERE id = 1";
        return db.query(query, [data.app_name, data.background_url, data.logo_url]);
    }
};

module.exports = Setting;