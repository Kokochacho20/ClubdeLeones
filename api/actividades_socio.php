<?php
require_once 'db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    exit;
}

try {
    $conn = getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error de conexión a la base de datos']);
    exit;
}

$idSocio = isset($_GET['id_socio']) ? $_GET['id_socio'] : null;
$desde = isset($_GET['desde']) ? $_GET['desde'] : null;
$hasta = isset($_GET['hasta']) ? $_GET['hasta'] : null;

if (!$idSocio) {
    echo json_encode([]);
    oci_close($conn);
    exit;
}

$sql = "SELECT 
            a.ID_ACTIV_SOC,
            a.ID_ACTIVIDAD,
            ac.NOMBRE_ACTIVIDAD,
            TO_CHAR(a.FEC_COMPROM, 'YYYY-MM-DD') AS FEC_COMPROM,
            a.ESTADO,
            a.MONTO_COMPROM,
            a.SALDO_COMPROM
        FROM ACTIV_SOCIO a
        JOIN ACTIVIDADES ac ON ac.ID_ACTIVIDAD = a.ID_ACTIVIDAD
        WHERE a.ID_SOCIO = :p_id_socio";

if ($desde) {
    $sql .= " AND a.FEC_COMPROM >= TO_DATE(:p_desde, 'YYYY-MM-DD')";
}
if ($hasta) {
    $sql .= " AND a.FEC_COMPROM <= TO_DATE(:p_hasta, 'YYYY-MM-DD')";
}

$sql .= " ORDER BY a.FEC_COMPROM DESC, ac.NOMBRE_ACTIVIDAD";

$stmt = oci_parse($conn, $sql);

oci_bind_by_name($stmt, ':p_id_socio', $idSocio);

if ($desde) {
    oci_bind_by_name($stmt, ':p_desde', $desde);
}
if ($hasta) {
    oci_bind_by_name($stmt, ':p_hasta', $hasta);
}

oci_execute($stmt);

$result = [];
while ($row = oci_fetch_assoc($stmt)) {
    $result[] = $row;
}

echo json_encode($result);

oci_free_statement($stmt);
oci_close($conn);