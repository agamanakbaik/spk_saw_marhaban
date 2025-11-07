// app/controllers/authController.js
// Menangani proses login. (BERSIH DARI LOGIKA BISNIS)

// HAPUS: require('bcrypt'), require('jwt'), require('db'), const JWT_SECRET
// TAMBAHKAN:
const AuthModel = require('../models/authModel');

exports.login = async(req, res) => {
  	const { username, password } = req.body;

  	// 1. Validasi input (Tugas Controller)
  	if (!username || !password) {
  	  	return res.status(400).json({ message: 'Username dan password wajib diisi.' });
  	}

  	try {
  	  	// 2. Panggil Model (Tugas Controller)
        // Model akan 'throw' error jika login gagal
  	  	const result = await AuthModel.login(username, password);

  	  	// 3. Kirim respons sukses (Tugas Controller)
        // 'result' berisi { user, token }
  	  	res.json({
  	  	  	message: 'Login berhasil.',
            ...result // kirim { user: {...}, token: '...' }
  	  	});

  	} catch (err) {
  	  	// 4. Tangani error dari Model (Tugas Controller)
  	  	console.error('authController.login error:', err);

        // Jika error-nya adalah 'Username atau password salah.', kirim 401
        if (err.message === 'Username atau password salah.') {
            return res.status(401).json({ message: err.message });
        }
        
        // Untuk error tak terduga lainnya (misal DB mati)
  	  	res.status(500).json({ message: 'Terjadi kesalahan server.' });
  	}
};