<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // LISTAR Tipos de Pago
    $sql = "SELECT id_tip_pago, nombre_tip_pago, periodicidad, tipo, moneda 
            FROM tipo_pago 
            ORDER BY id_tip_pago";
    $stid = oci_parse($conn, $sql);
    oci_execute($stid);

    $tipopagos = [];
    while ($row = oci_fetch_assoc($stid)) {
        $tipopagos[] = $row;
    }
    echo json_encode($tipopagos);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $accion = $data['accion'] ?? '';

    $id_tip_pago = $data['id_tip_pago'] ?? null;
    $nombre_tip_pago = $data['nombre_tip_pago'] ?? null;
    $periodicidad = $data['periodicidad'] ?? null;
    $tipo = $data['tipo'] ?? null;
    $moneda = $data['moneda'] ?? null;

    // insertar tipo de pago
    if ($accion === 'crear') {
        $sql = "BEGIN insertar_tipo_pago(:p_nombre_tip_pago, :p_periodicidad, :p_tipo, :p_moneda); END;";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_nombre_tip_pago", $nombre_tip_pago);
        oci_bind_by_name($stid, ":p_periodicidad", $periodicidad);
        oci_bind_by_name($stid, ":p_tipo", $tipo);
        oci_bind_by_name($stid, ":p_moneda", $moneda);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Tipo de pago agregado correctamente"]);
        }
        exit;
    }

    // actualizar tipo de pago
    if ($accion === 'actualizar') {
        if (!$id_tip_pago) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id del tipo de pago para actualizar"]);
            exit;
        }
        $sql = "BEGIN actualizar_tipo_pago(:p_id_tip_pago, :p_nombre_tip_pago, :p_periodicidad, :p_tipo, :p_moneda); END;";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_tip_pago", $id_tip_pago);
        oci_bind_by_name($stid, ":p_nombre_tip_pago", $nombre_tip_pago);
        oci_bind_by_name($stid, ":p_periodicidad", $periodicidad);
        oci_bind_by_name($stid, ":p_tipo", $tipo);
        oci_bind_by_name($stid, ":p_moneda", $moneda);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Tipo de pago actualizado correctamente"]);
        }
        exit;
    }

    // eliminar tipo de pago
    if ($accion === 'eliminar') {
        if (!$id_tip_pago) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id del tipo de pago para eliminar"]);
            exit;
        }
        $sql = "BEGIN eliminar_tipo_pago(:p_id_tip_pago); END;";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_tip_pago", $id_tip_pago);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Tipo de pago eliminado correctamente"]);
        }
        exit;
    }

    // acción no reconocida
    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Acción no reconocida"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
