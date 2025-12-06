<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // LISTAR Tipos de Cambio
    $sql = "SELECT 
                id_tip_cambio,
                TO_CHAR(fec_tip_cambio, 'YYYY-MM-DD') AS fec_tip_cambio,
                tc_compra,
                tc_venta
            FROM tipo_cambio
            ORDER BY id_tip_cambio";
    $stid = oci_parse($conn, $sql);
    oci_execute($stid);

    $tiposcambio = [];
    while ($row = oci_fetch_assoc($stid)) {
        $tiposcambio[] = $row;
    }
    echo json_encode($tiposcambio);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $accion = $data['accion'] ?? '';

    $id_tip_cambio  = $data['id_tip_cambio'] ?? null;
    $fec_tip_cambio = $data['fec_tip_cambio'] ?? null;
    $tc_compra      = $data['tc_compra'] ?? null;
    $tc_venta       = $data['tc_venta'] ?? null;

    // CREAR tipo de cambio
    if ($accion === 'crear') {
        $sql = "BEGIN insertar_tipo_cambio(
                    TO_DATE(:p_fec_tip_cambio, 'YYYY-MM-DD'),
                    :p_tc_compra,
                    :p_tc_venta
                ); END;";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_fec_tip_cambio", $fec_tip_cambio);
        oci_bind_by_name($stid, ":p_tc_compra", $tc_compra);
        oci_bind_by_name($stid, ":p_tc_venta", $tc_venta);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Tipo de cambio agregado correctamente"]);
        }
        exit;
    }

    // ACTUALIZAR tipo de cambio
    if ($accion === 'actualizar') {
        if (!$id_tip_cambio) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id del tipo de cambio para actualizar"]);
            exit;
        }

        $sql = "BEGIN actualizar_tipo_cambio(
                    :p_id_tip_cambio,
                    TO_DATE(:p_fec_tip_cambio, 'YYYY-MM-DD'),
                    :p_tc_compra,
                    :p_tc_venta
                ); END;";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_tip_cambio", $id_tip_cambio);
        oci_bind_by_name($stid, ":p_fec_tip_cambio", $fec_tip_cambio);
        oci_bind_by_name($stid, ":p_tc_compra", $tc_compra);
        oci_bind_by_name($stid, ":p_tc_venta", $tc_venta);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Tipo de cambio actualizado correctamente"]);
        }
        exit;
    }

    // ELIMINAR tipo de cambio
    if ($accion === 'eliminar') {
        if (!$id_tip_cambio) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id del tipo de cambio para eliminar"]);
            exit;
        }

        $sql = "BEGIN eliminar_tipo_cambio(:p_id_tip_cambio); END;";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_tip_cambio", $id_tip_cambio);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Tipo de cambio eliminado correctamente"]);
        }
        exit;
    }

    // Acción no reconocida
    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Acción no reconocida"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
