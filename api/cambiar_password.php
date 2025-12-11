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

$correo    = isset($input['correo'])    ? trim($input['correo'])    : '';
$nuevaClave = isset($input['clave'])    ? trim($input['clave'])     : '';

if ($correo === '' || $nuevaClave === '') {
    echo json_encode(['ok' => false, 'mensaje' => 'Debe indicar correo y nueva contraseña']);
    exit;
}

$hash = password_hash($nuevaClave, PASSWORD_DEFAULT);

$usuario_db   = 'ADMLEON';
$password_db  = 'ADMLEON';
$cadena       = 'localhost/XE';

$conn = oci_connect($usuario_db, $password_db, $cadena, 'AL32UTF8');

if (!$conn) {
    $e = oci_error();
    echo json_encode(['ok' => false, 'mensaje' => 'Error de conexión: ' . $e['message']]);
    exit;
}

$sql = "UPDATE USUARIOS
        SET clave_usuario = :clave
        WHERE correo_usuario = :correo
          AND estado_usuario = 'A'";

$stmt = oci_parse($conn, $sql);

oci_bind_by_name($stmt, ':clave',  $hash);
oci_bind_by_name($stmt, ':correo', $correo);

$ok = oci_execute($stmt, OCI_NO_AUTO_COMMIT);

if (!$ok) {
    $e = oci_error($stmt);
    oci_rollback($conn);
    oci_free_statement($stmt);
    oci_close($conn);
    echo json_encode(['ok' => false, 'mensaje' => 'Error al actualizar contraseña: ' . $e['message']]);
    exit;
}

if (oci_num_rows($stmt) === 0) {
    oci_rollback($conn);
    oci_free_statement($stmt);
    oci_close($conn);
    echo json_encode(['ok' => false, 'mensaje' => 'No se encontró un usuario activo con ese correo']);
    exit;
}

oci_commit($conn);
oci_free_statement($stmt);
oci_close($conn);

echo json_encode(['ok' => true, 'mensaje' => 'Contraseña actualizada correctamente']);
