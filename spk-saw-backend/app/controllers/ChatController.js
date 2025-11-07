// app/controllers/chatController.js

// HAPUS SEMUA require('GoogleGenerativeAI'), ('path'), ('dotenv'),
// HAPUS SEMUA const genAI, model, dan systemInstruction
// TAMBAHKAN:
const ChatModel = require('../models/chatModel'); // Panggil Model

// Fungsi untuk menangani chat
exports.askChatbot = async (req, res) => {
  	const { message } = req.body;
  	if (!message) {
  	  	return res.status(400).json({ message: "Pesan tidak boleh kosong." });
  	}

  	try {
        // 1. Panggil Model dengan pesan dari user
  	  	const replyText = await ChatModel.ask(message);
  	  	
        // 2. Kirim balasan dari Model ke user
  	  	res.json({ reply: replyText });

  	} catch (error) {
  	  	// 3. Tangani error yang di-'throw' oleh Model
  		console.error("Error di ChatController:", error.message);
  	  	res.status(500).json({ message: error.message });
  	}
};