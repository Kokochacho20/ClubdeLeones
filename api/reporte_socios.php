<?php
require_once 'db.php';

ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => true, "mensaje" => "Método no permitido"]);
    exit;
}

$tipo = isset($_GET['tipo']) ? trim($_GET['tipo']) : '';
$estado = isset($_GET['estado']) ? trim($_GET['estado']) : '';
$fechaDesde = isset($_GET['fecha_desde']) ? trim($_GET['fecha_desde']) : '';

$sql = "SELECT 
            id_socio,
            nombre_socio,
            \"NÚMERO_SOCIO\" AS numero_socio,
            tipo_socio,
            estado_socio,
            TO_CHAR(fecha_ingreso, 'YYYY-MM-DD') AS fec_ingreso,
            cod_distrito,
            desc_direccion
        FROM socios
        WHERE 1 = 1";

if ($tipo !== '') {
    $sql .= " AND tipo_socio = :tipo_socio";
}
if ($estado !== '') {
    $sql .= " AND estado_socio = :estado_socio";
}
if ($fechaDesde !== '') {
    $sql .= " AND fecha_ingreso >= TO_DATE(:fecha_desde, 'YYYY-MM-DD')";
}

$sql .= " ORDER BY fecha_ingreso DESC, id_socio DESC FETCH FIRST 10 ROWS ONLY";

$stid = oci_parse($conn, $sql);

if ($tipo !== '') {
    oci_bind_by_name($stid, ":tipo_socio", $tipo);
}
if ($estado !== '') {
    oci_bind_by_name($stid, ":estado_socio", $estado);
}
if ($fechaDesde !== '') {
    oci_bind_by_name($stid, ":fecha_desde", $fechaDesde);
}

if (!@oci_execute($stid)) {
    $e = oci_error($stid);
    http_response_code(500);
    echo json_encode(["error" => true, "mensaje" => $e['message']]);
    exit;
}

$resultado = [];
while ($row = oci_fetch_assoc($stid)) {
    $resultado[] = $row;
}

echo json_encode($resultado);