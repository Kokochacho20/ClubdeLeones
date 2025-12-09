<?php
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

$nombre   = isset($input['nombre'])   ? trim($input['nombre'])   : '';
$correo   = isset($input['correo'])   ? trim($input['correo'])   : '';
$clave    = isset($input['clave'])    ? trim($input['clave'])    : '';
$telefono = isset($input['telefono']) ? trim($input['telefono']) : '';
$rol      = isset($input['rol'])      ? trim($input['rol'])      : 'SOCIO';

if ($nombre === '' || $correo === '' || $clave === '') {
    echo json_encode(['ok' => false, 'mensaje' => 'Nombre, correo y clave son obligatorios']);
    exit;
}

$hash = password_hash($clave, PASSWORD_DEFAULT);

$usuario_db   = 'ADMJDRU';
$password_db  = 'ADMJDRU';
$cadena       = 'localhost/XE';

$conn = oci_connect($usuario_db, $password_db, $cadena, 'AL32UTF8');

if (!$conn) {
    $e = oci_error();
    echo json_encode(['ok' => false, 'mensaje' => 'Error de conexión: ' . $e['message']]);
    exit;
}

$sql = "INSERT INTO USUARIOS (
            nombre_usuario,
            correo_usuario,
            clave_usuario,
            telefono_usuario,
            rol_usuario
        ) VALUES (
            :nombre,
            :correo,
            :clave,
            :telefono,
            :rol
        )";

$stmt = oci_parse($conn, $sql);

oci_bind_by_name($stmt, ':nombre',   $nombre);
oci_bind_by_name($stmt, ':correo',   $correo);
oci_bind_by_name($stmt, ':clave',    $hash);
oci_bind_by_name($stmt, ':telefono', $telefono);
oci_bind_by_name($stmt, ':rol',      $rol);

$ok = oci_execute($stmt, OCI_NO_AUTO_COMMIT);

if (!$ok) {
    $e = oci_error($stmt);
    oci_rollback($conn);

    if (strpos($e['message'], 'unique') !== false || strpos($e['message'], 'UNIQUE') !== false) {
        echo json_encode(['ok' => false, 'mensaje' => 'Ya existe un usuario con ese correo']);
    } else {
        echo json_encode(['ok' => false, 'mensaje' => 'Error al crear usuario: ' . $e['message']]);
    }

    oci_free_statement($stmt);
    oci_close($conn);
    exit;
}

oci_commit($conn);
oci_free_statement($stmt);
oci_close($conn);

echo json_encode(['ok' => true, 'mensaje' => 'Usuario creado correctamente']);