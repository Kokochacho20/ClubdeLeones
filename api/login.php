<?php
session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(['ok' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$usuario  = isset($input['usuario']) ? trim($input['usuario']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';

if ($usuario === '' || $password === '') {
    echo json_encode(['ok' => false, 'mensaje' => 'Debe completar correo y contraseña']);
    exit;
}

require_once __DIR__ . '/db.php';


$conn = getConnection();

if (!$conn) {
    echo json_encode(['ok' => false, 'mensaje' => 'Error de conexión con la base de datos']);
    exit;
}

$sql = "SELECT id_usuario,
               nombre_usuario,
               correo_usuario,
               clave_usuario,
               rol_usuario,
               estado_usuario
        FROM   USUARIOS
        WHERE  correo_usuario = :correo";

$stmt = oci_parse($conn, $sql);
if (!$stmt) {
    $e = oci_error($conn);
    echo json_encode(['ok' => false, 'mensaje' => 'Error al preparar la consulta: ' . $e['message']]);
    exit;
}

oci_bind_by_name($stmt, ':correo', $usuario);

$ok = oci_execute($stmt);
if (!$ok) {
    $e = oci_error($stmt);
    echo json_encode(['ok' => false, 'mensaje' => 'Error al consultar usuario: ' . $e['message']]);
    exit;
}

$row = oci_fetch_assoc($stmt);

if (!$row) {
    echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña inválidos']);
    exit;
}

if ($row['ESTADO_USUARIO'] !== 'A') {
    echo json_encode(['ok' => false, 'mensaje' => 'Usuario inactivo']);
    exit;
}

$hash = $row['CLAVE_USUARIO'] ?? '';

if (!is_string($hash) || $hash === '') {
    echo json_encode(['ok' => false, 'mensaje' => 'Configuración inválida de la contraseña del usuario']);
    exit;
}

if (!password_verify($password, $hash)) {
    echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña inválidos']);
    exit;
}

$_SESSION['id_usuario'] = $row['ID_USUARIO'];
$_SESSION['usuario']    = $row['CORREO_USUARIO'];
$_SESSION['nombre']     = $row['NOMBRE_USUARIO'];
$_SESSION['rol']        = $row['ROL_USUARIO'];

echo json_encode([
    'ok'      => true,
    'usuario' => $row['NOMBRE_USUARIO'],
    'correo'  => $row['CORREO_USUARIO'],
    'rol'     => $row['ROL_USUARIO']
]);
exit;
