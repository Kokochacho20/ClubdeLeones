<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    exit;
}

$idSocio = isset($_GET['id_socio']) ? trim($_GET['id_socio']) : null;
$desde   = isset($_GET['desde']) ? trim($_GET['desde']) : null;
$hasta   = isset($_GET['hasta']) ? trim($_GET['hasta']) : null;

$sql = "SELECT a.id_activ_soc,
               a.fec_comprom,
               a.estado,
               a.monto_comprom,
               a.saldo_comprom,
               s.id_socio,
               s.nombre_socio,
               ac.id_actividad,
               ac.nombre_actividad,
               ac.fecha_actividad
          FROM activ_socio a
          JOIN socios s       ON s.id_socio = a.id_socio
          JOIN actividades ac ON ac.id_actividad = a.id_actividad
         WHERE 1 = 1";

$params = [];

if ($idSocio !== null && $idSocio !== '') {
    $sql .= " AND a.id_socio = :id_socio";
    $params[':id_socio'] = $idSocio;
}

if ($desde !== null && $desde !== '') {
    $sql .= " AND a.fec_comprom >= TO_DATE(:desde, 'YYYY-MM-DD')";
    $params[':desde'] = $desde;
}

if ($hasta !== null && $hasta !== '') {
    $sql .= " AND a.fec_comprom <= TO_DATE(:hasta, 'YYYY-MM-DD')";
    $params[':hasta'] = $hasta;
}

$sql .= " ORDER BY a.fec_comprom DESC";

$stid = oci_parse($conn, $sql);
foreach ($params as $nombre => &$valor) {
    oci_bind_by_name($stid, $nombre, $valor);
}
oci_execute($stid);

$registros = [];
while ($row = oci_fetch_assoc($stid)) {
    $registros[] = $row;
}
oci_free_statement($stid);

echo json_encode($registros);