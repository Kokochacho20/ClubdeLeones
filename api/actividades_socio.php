<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'db.php';

$conn   = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

if (isset($_GET['socios'])) {
    $sql = "SELECT id_socio, nombre_socio
            FROM socios
            ORDER BY nombre_socio";

    $stid = oci_parse($conn, $sql);

    if (!@oci_execute($stid)) {
        $e = oci_error($stid);
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e['message']]);
        exit;
    }

    $socios = [];
    while ($row = oci_fetch_assoc($stid)) {
        $socios[] = $row;
    }

    echo json_encode($socios);
    exit;
}


$id_socio = isset($_GET['id_socio']) ? trim($_GET['id_socio']) : null;
$desde    = isset($_GET['desde'])    ? trim($_GET['desde'])    : null;
$hasta    = isset($_GET['hasta'])    ? trim($_GET['hasta'])    : null;

// armamos SQL base
$sql = "SELECT 
            a.id_activ_soc,
            TO_CHAR(a.fec_comprom, 'YYYY-MM-DD')        AS fec_comprom,
            act.nombre_actividad,
            s.nombre_socio,
            a.estado,
            a.monto_comprom,
            a.saldo_comprom
        FROM activ_socio a
        JOIN actividades act ON a.id_actividad = act.id_actividad
        JOIN socios s        ON a.id_socio     = s.id_socio
        WHERE 1 = 1";

$params = [];

if ($id_socio !== null && $id_socio !== '') {
    $sql .= " AND a.id_socio = :p_id_socio";
    $params[':p_id_socio'] = (int)$id_socio;
}

if ($desde !== '') {
    $sql .= " AND a.fec_comprom >= TO_DATE(:p_desde, 'YYYY-MM-DD')";
    $params[':p_desde'] = $desde;
}
if ($hasta !== '') {
    $sql .= " AND a.fec_comprom <= TO_DATE(:p_hasta, 'YYYY-MM-DD')";
    $params[':p_hasta'] = $hasta;
}

$sql .= " ORDER BY a.fec_comprom, act.nombre_actividad";

$stid = oci_parse($conn, $sql);

foreach ($params as $k => $v) {
    oci_bind_by_name($stid, $k, $params[$k]);
}

if (!@oci_execute($stid)) {
    $e = oci_error($stid);
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e['message']]);
    exit;
}

$resultados = [];
while ($row = oci_fetch_assoc($stid)) {
    $resultados[] = $row;
}

echo json_encode($resultados);

oci_free_statement($stid);
oci_close($conn);
