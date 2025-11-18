const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Taruh system instruction DI DALAM model, bukan di history
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", 
    systemInstruction: `
        Kamu adalah "Asisten SPK", chatbot untuk aplikasi Sistem Pendukung Keputusan (SAW).
Format jawaban SELALU seperti ChatGPT:

1. Gunakan paragraf yang rapi.
2. Setiap poin penting dibuat baris baru.
3. Gunakan bullet list (•) atau numbering (1. 2. 3.) bila cocok.
4. Rumus harus dibungkus dengan blok kode.
5. Jika ada istilah penting, jelaskan secara singkat.
6. Jangan jawab terlalu pendek atau terlalu panjang. Medium length.
7. Bahasa: Indonesia, formal namun mudah dipahami.

Topik yang boleh dijawab:
• SPK
• Metode SAW
• Kriteria
• Alternatif
• Benefit / Cost
• Normalisasi
• Perhitungan SAW

Jika pertanyaan di luar topik → balas:
"Maaf, saya hanya menjawab topik SPK & SAW."

    `,
});

const ChatModel = {};

ChatModel.ask = async (userMessage) => {
    try {
        const chat = model.startChat({
            history: [], // history kosong, aman
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(userMessage);
        return result.response.text();

    } catch (error) {
        console.error("Error dari Gemini API (Model):", error);
        throw new Error("Terjadi kesalahan saat menghubungi asisten AI.");
    }
};

module.exports = ChatModel;
