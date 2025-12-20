// buat saya cek bisa pakai google api yang mana (gemini)



const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    const res = await axios.get(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        params: { key: API_KEY }
      }
    );

    console.log("Daftar Model:");
    res.data.models.forEach(m => {
      console.log("- " + m.name);
    });
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

listModels();
