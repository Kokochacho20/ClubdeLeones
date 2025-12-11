<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejo de preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

try {
    $conn = getConnection();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error de conexión a la base de datos']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? $_GET['id'] : null;

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);
if (!is_array($data)) {
    $data = [];
}


if ($method === 'GET') {

    if ($id) {
        $sql = "SELECT id_tip_pago,
                       nombre_tip_pago,
                       periodicidad,
                       tipo,
                       moneda
                  FROM tipo_pago
                 WHERE id_tip_pago = :id";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ':id', $id);

        if (!@oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e['message']]);
            exit;
        }

        $row = oci_fetch_assoc($stid);
        if (!$row) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Tipo de pago no encontrado']);
            exit;
        }

        echo json_encode($row);
        exit;
    }

    $sql = "SELECT id_tip_pago,
                   nombre_tip_pago,
                   periodicidad,
                   tipo,
                   moneda
              FROM tipo_pago
          ORDER BY id_tip_pago";

    $stid = oci_parse($conn, $sql);

    if (!@oci_execute($stid)) {
        $e = oci_error($stid);
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e['message']]);
        exit;
    }

    $tipos = [];
    while ($row = oci_fetch_assoc($stid)) {
        $tipos[] = $row;
    }

    echo json_encode($tipos);
    exit;
}



if ($method === 'POST') {

    $nombre       = trim($data['nombre_tip_pago'] ?? $data['nombre'] ?? '');
    $periodicidad = $data['periodicidad'] ?? 'M';
    $tipo         = $data['tipo']         ?? 'I';
    $moneda       = $data['moneda']       ?? 'C';

    if (!$nombre) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'El nombre es obligatorio']);
        exit;
    }

    $plsql = "BEGIN insertar_tipo_pago(
                  :p_nombre_tip_pago,
                  :p_periodicidad,
                  :p_tipo,
                  :p_moneda
              ); END;";

    $stid = oci_parse($conn, $plsql);
    oci_bind_by_name($stid, ':p_nombre_tip_pago', $nombre);
    oci_bind_by_name($stid, ':p_periodicidad',   $periodicidad);
    oci_bind_by_name($stid, ':p_tipo',           $tipo);
    oci_bind_by_name($stid, ':p_moneda',         $moneda);

    if (!@oci_execute($stid)) {
        $e = oci_error($stid);
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => $e['message']]);
        exit;
    }

    echo json_encode(['ok' => true, 'mensaje' => 'Tipo de pago creado correctamente']);
    exit;
}


if ($method === 'PUT') {

    if (!$id) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'ID de tipo de pago no especificado']);
        exit;
    }

    $nombre       = trim($data['nombre_tip_pago'] ?? $data['nombre'] ?? '');
    $periodicidad = $data['periodicidad'] ?? 'M';
    $tipo         = $data['tipo']         ?? 'I';
    $moneda       = $data['moneda']       ?? 'C';

    if (!$nombre) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'El nombre es obligatorio']);
        exit;
    }

    $plsql = "BEGIN actualizar_tipo_pago(
                  :p_id_tip_pago,
                  :p_nombre_tip_pago,
                  :p_periodicidad,
                  :p_tipo,
                  :p_moneda
              ); END;";

    $stid = oci_parse($conn, $plsql);
    oci_bind_by_name($stid, ':p_id_tip_pago',     $id);
    oci_bind_by_name($stid, ':p_nombre_tip_pago', $nombre);
    oci_bind_by_name($stid, ':p_periodicidad',    $periodicidad);
    oci_bind_by_name($stid, ':p_tipo',            $tipo);
    oci_bind_by_name($stid, ':p_moneda',          $moneda);

    if (!@oci_execute($stid)) {
        $e = oci_error($stid);
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => $e['message']]);
        exit;
    }

    echo json_encode(['ok' => true, 'mensaje' => 'Tipo de pago actualizado correctamente']);
    exit;
}

if ($method === 'DELETE') {

    if (!$id) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'ID de tipo de pago no especificado']);
        exit;
    }

    $plsql = "BEGIN eliminar_tipo_pago(:p_id_tip_pago); END;";
    $stid  = oci_parse($conn, $plsql);
    oci_bind_by_name($stid, ':p_id_tip_pago', $id);

    if (!@oci_execute($stid)) {
        $e = oci_error($stid);
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => $e['message']]);
        exit;
    }

    http_response_code(204);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método no permitido']);

if ($conn) {
    oci_close($conn);
}
