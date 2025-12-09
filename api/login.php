<?php
session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$usuario = isset($input['usuario']) ? trim($input['usuario']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';

if ($usuario === '' || $password === '') {
    echo json_encode(['ok' => false, 'mensaje' => 'Debe completar correo y contraseña']);
    exit;
}

require_once 'db.php';

if (!$conn) {
    http_response_code(500);
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
oci_bind_by_name($stmt, ':correo', $usuario);
oci_execute($stmt);

$row = oci_fetch_assoc($stmt);

if (!$row) {
    echo json_encode(['ok' => false, 'mensaje' => 'Usuario o contraseña inválidos']);
    exit;
}

if ($row['ESTADO_USUARIO'] !== 'A') {
    echo json_encode(['ok' => false, 'mensaje' => 'Usuario inactivo']);
    exit;
}

$hash = $row['CLAVE_USUARIO'];

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