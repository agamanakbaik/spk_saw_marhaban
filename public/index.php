<!-- halaman lodin -->
 <?php
// require_once __DIR__ . '/../inc/config.php';
// session_start();
// if (isset($_POST['login'])) {
// $u = trim($_POST['username']);
// $p = $_POST['password'];
// $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :u LIMIT 1");
// $stmt->execute(['u'=>$u]);
// $user = $stmt->fetch();
// if ($user && password_verify($p, $user['password'])) {
// unset($user['password']);
// $_SESSION['user'] = $user;
// if ($user['role'] === 'superadmin') header('Location: dashboard_super.php');
// else header('Location: dashboard_admin.php');
// exit;
// } else $error = 'Username atau password salah.';
// }
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Login - SPK SAW Marhaban</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center h-screen">
<div class="bg-white p-6 rounded shadow w-96">
<h2 class="text-xl font-semibold mb-4">Login SPK Marhaban</h2>
<?php if(isset($error)): ?><div class="text-red-600 mb-2"><?=htmlspecialchars($error)?></div><?php endif; ?>
<form method="post">
<label class="block">Username</label>
<input name="username" class="w-full border p-2 rounded mb-3" required>
<label class="block">Password</label>
<input name="password" type="password" class="w-full border p-2 rounded mb-4" required>
<button name="login" class="w-full bg-blue-600 text-white p-2 rounded">Login</button>
</form>
</div>
</body>
</html>