// app/models/chatModel.js
// Bertanggung jawab atas koneksi dan logika ke Gemini API

const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// 1. Inisialisasi API dipindahkan ke Model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

// 2. Instruksi sistem juga menjadi bagian dari Model
const systemInstruction = `
    Kamu adalah "Asisten SPK", chatbot AI yang ramah untuk aplikasi Sistem Pendukung Keputusan (SPK) metode SAW.
    Tugasmu adalah menjawab pertanyaan pengguna HANYA seputar topik SPK, metode SAW, kriteria, alternatif, dan konsep terkait.
    - Jika ditanya "Apa itu SAW?", jelaskan sebagai Simple Additive Weighting.
    - Jika ditanya "Apa itu Kriteria?", jelaskan sebagai parameter penilaian (seperti Kas, Laba, Hutang).
    - Jika ditanya "Apa itu Alternatif?", jelaskan sebagai pilihan yang dievaluasi (seperti "Laporan Keuangan 2023").
    - Jika ditanya "Benefit" atau "Cost", jelaskan perbedaannya (Benefit = semakin besar semakin baik, Cost = semakin kecil semakin baik).
    - Jika pengguna bertanya di luar topik (misal: "resep masakan", "cuaca", "sejarah"), JANGAN DIJAWAB. Jawab dengan sopan: "Maaf, saya hanya bisa menjawab pertanyaan seputar SPK dan metode SAW."
    - Jawablah dengan singkat, jelas, dan dalam Bahasa Indonesia.
`;

const ChatModel = {};

// 3. Buat satu fungsi yang bisa dipanggil Controller
ChatModel.ask = async (userMessage) => {
    try {
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemInstruction }] },
                { role: "model", parts: [{ text: "Baik, saya mengerti. Saya adalah Asisten SPK. Apa yang ingin Anda tanyakan?" }] }
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        const text = response.text();
        
        return text; // Kembalikan teks balasan

    } catch (error) {
        console.error("Error dari Gemini API (Model):", error);
        // 'throw' error agar bisa ditangkap oleh 'catch' di Controller
        throw new Error("Terjadi kesalahan saat menghubungi asisten AI.");
    }
};

module.exports = ChatModel;