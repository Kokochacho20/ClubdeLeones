<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn   = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // LISTAR TRANSACCIONES
    $sql = "SELECT id_transaccion,
                   id_activ_soc,
                   TO_CHAR(fec_transaccion, 'YYYY-MM-DD') AS fec_transaccion,
                   id_tip_pago,
                   mes_pago,
                   an_pago,
                   moneda_transac,
                   monto_colones,
                   monto_dolares,
                   id_tip_cambio
            FROM transacciones
            ORDER BY id_transaccion";

    $stid = oci_parse($conn, $sql);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        http_response_code(400);
        echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        exit;
    }

    $transacciones = [];
    while ($row = oci_fetch_assoc($stid)) {
        $transacciones[] = $row;
    }

    echo json_encode($transacciones);
    exit;
}

if ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $accion          = $data['accion'] ?? '';
    $id_transaccion  = $data['id_transaccion'] ?? null;
    $id_activ_soc    = $data['id_activ_soc'] ?? null;
    $fec_transaccion = $data['fec_transaccion'] ?? null;
    $id_tip_pago     = $data['id_tip_pago'] ?? null;
    $mes_pago        = $data['mes_pago'] ?? null;
    $an_pago         = $data['an_pago'] ?? null;
    $moneda_transac  = $data['moneda_transac'] ?? 'C';
    $monto_colones   = $data['monto_colones'] ?? null;
    $monto_dolares   = $data['monto_dolares'] ?? null;
    $id_tip_cambio   = $data['id_tip_cambio'] ?? null;

    // INSERTAR TRANSACCION
    if ($accion === 'crear') {

        if (!$id_activ_soc || !$fec_transaccion || !$id_tip_pago || !$mes_pago || !$an_pago || !$monto_colones || !$id_tip_cambio) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Faltan datos obligatorios"]);
            exit;
        }

        $sql = "BEGIN insertar_transaccion(
                    :p_id_activ_soc,
                    TO_DATE(:p_fec_transaccion, 'YYYY-MM-DD'),
                    :p_id_tip_pago,
                    :p_mes_pago,
                    :p_an_pago,
                    :p_moneda_transac,
                    :p_monto_colones,
                    :p_monto_dolares,
                    :p_id_tip_cambio
                ); END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_activ_soc", $id_activ_soc);
        oci_bind_by_name($stid, ":p_fec_transaccion", $fec_transaccion);
        oci_bind_by_name($stid, ":p_id_tip_pago", $id_tip_pago);
        oci_bind_by_name($stid, ":p_mes_pago", $mes_pago);
        oci_bind_by_name($stid, ":p_an_pago", $an_pago);
        oci_bind_by_name($stid, ":p_moneda_transac", $moneda_transac);
        oci_bind_by_name($stid, ":p_monto_colones", $monto_colones);
        oci_bind_by_name($stid, ":p_monto_dolares", $monto_dolares);
        oci_bind_by_name($stid, ":p_id_tip_cambio", $id_tip_cambio);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Transacción agregada correctamente"]);
        }
        exit;
    }

    // ACTUALIZAR TRANSACCION
    if ($accion === 'actualizar') {

        if (!$id_transaccion) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id de la transacción para actualizar"]);
            exit;
        }

        $sql = "BEGIN actualizar_transaccion(
                    :p_id_transaccion,
                    :p_id_activ_soc,
                    TO_DATE(:p_fec_transaccion, 'YYYY-MM-DD'),
                    :p_id_tip_pago,
                    :p_mes_pago,
                    :p_an_pago,
                    :p_moneda_transac,
                    :p_monto_colones,
                    :p_monto_dolares,
                    :p_id_tip_cambio
                ); END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_transaccion", $id_transaccion);
        oci_bind_by_name($stid, ":p_id_activ_soc", $id_activ_soc);
        oci_bind_by_name($stid, ":p_fec_transaccion", $fec_transaccion);
        oci_bind_by_name($stid, ":p_id_tip_pago", $id_tip_pago);
        oci_bind_by_name($stid, ":p_mes_pago", $mes_pago);
        oci_bind_by_name($stid, ":p_an_pago", $an_pago);
        oci_bind_by_name($stid, ":p_moneda_transac", $moneda_transac);
        oci_bind_by_name($stid, ":p_monto_colones", $monto_colones);
        oci_bind_by_name($stid, ":p_monto_dolares", $monto_dolares);
        oci_bind_by_name($stid, ":p_id_tip_cambio", $id_tip_cambio);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Transacción actualizada correctamente"]);
        }
        exit;
    }

    // ELIMINAR TRANSACCION
    if ($accion === 'eliminar') {

        if (!$id_transaccion) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id de la transacción para eliminar"]);
            exit;
        }

        $sql = "BEGIN eliminar_transaccion(:p_id_transaccion); END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_transaccion", $id_transaccion);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Transacción eliminada correctamente"]);
        }
        exit;
    }

    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Accion no reconocida"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Metodo no permitido"]);
