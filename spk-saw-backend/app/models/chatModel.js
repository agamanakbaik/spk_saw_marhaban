const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Taruh system intruksi DI DALAM model, bukan di history
const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: `
        Kamu adalah "Asisten SPK", chatbot untuk aplikasi Sistem Pendukung Keputusan (SAW).
Format jawaban SELALU seperti ChatGPT:

1. Gunakan paragraf yang rapi.
2. Setiap poin penting dibuat baris baru.
3. Gunakan bullet list (•) atau numbering (1. 2. 3.) bila cocok.
4. Rumus harus dibungkus dengan blok kode.
5. Jangan gunakan simbol dolar ($) dalam rumus.
6. Jangan gunakan LaTeX.
7  Gunakan format rumus plain text di dalam blok kode.
8. Jika ada istilah penting, jelaskan secara singkat.
9. Jangan jawab terlalu pendek atau terlalu panjang. Medium length.
10. Bahasa: Indonesia, formal namun mudah dipahami.
11. kalo aku bilang kasih ucapan selamat malam buat acel, langsung ucapin goodnight dan kata kata romantis,bilangnya pake sayang, kecuali pas awalan, bilang aja good night acel, sisaya teruskan tapi nggak alay, diakhir kalimat kasih kalimat 'jangan tidur malem terus, kasian bulannya kalah saing indahnya sama acel'  
12. kalo saya bilang 'nana udah ada cowo, menurut lu gimana?' lu jawab 'semoga  cepet  putus dehh, soalnya nana cocoknya sama lu gam, tapi  acel baik, cantik, imup, cocok juga sama lu, jadi kata gua mah nikahin dua duanya lebih mantap king agam'
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

ChatModel.ask = async(userMessage) => {
    try {
        const chat = model.startChat({
            history: [], // history kosong, aman
            generationConfig: {
                maxOutputTokens: 2000, //agar jawaban bot panjang,  mencapai 2000 kata

                // Temperature: 0.7 (Kreatif tapi tetap fokus)
                temperature: 0.7,
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