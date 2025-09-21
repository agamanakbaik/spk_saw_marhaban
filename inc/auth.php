<!-- fungsi autetikasi  dan helper -->
 <?php
// inc/auth.php
session_start();
require_once __DIR__ . '/config.php';


function is_logged_in() {
return isset($_SESSION['user']);
}


function require_login() {
if (!is_logged_in()) {
header('Location: /public/index.php');
exit;
}
}


function require_role($role) {
if (!is_logged_in() || $_SESSION['user']['role'] !== $role) {
header('HTTP/1.1 403 Forbidden');
echo 'Akses ditolak.'; exit;
}
}


function login($username, $password) {
global $pdo;
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = :u LIMIT 1");
$stmt->execute(['u'=>$username]);
$user = $stmt->fetch();
if ($user && password_verify($password, $user['password'])) {
unset($user['password']);
$_SESSION['user'] = $user;
return true;
}
return false;
}


function logout() {
session_unset();
session_destroy();
}