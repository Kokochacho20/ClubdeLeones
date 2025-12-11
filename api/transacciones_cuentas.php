<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getConnection();

if ($method === 'GET') {
    // LISTAR TRANSACCIONES
    $sql = "SELECT 
                id_transac_cta,
                tipo_transac_cta,
                id_cuenta_bco_origen,
                id_cuenta_bco_destino,
                moneda_transac_cta,
                monto_colones,
                monto_dolares,
                id_tip_cambio,
                TO_CHAR(fec_transac_cta, 'YYYY-MM-DD') AS fec_transac_cta,
                conciliada,
                TO_CHAR(fec_concilia, 'YYYY-MM-DD') AS fec_concilia
            FROM transac_cta
            ORDER BY id_transac_cta";

    $stid = oci_parse($conn, $sql);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        http_response_code(500);
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
    $accion = $_POST['accion'] ?? '';

    $id_transac_cta = $_POST['id_transac_cta'] ?? null;
    $tipo_transac_cta = $_POST['tipo_transac_cta'] ?? 'D';
    $id_cuenta_bco_origen  = $_POST['id_cuenta_bco_origen'] ?? null;
    $id_cuenta_bco_destino = $_POST['id_cuenta_bco_destino'] ?? null;
    $moneda_transac_cta = $_POST['moneda_transac_cta'] ?? 'C';
    $monto_colones = $_POST['monto_colones'] ?? null;
    $monto_dolares = $_POST['monto_dolares'] ?? null;
    $id_tip_cambio = $_POST['id_tip_cambio'] ?? null;

    $fec_transac_cta = isset($_POST['fec_transac_cta']) && $_POST['fec_transac_cta'] !== ''
        ? $_POST['fec_transac_cta']
        : null;

    $conciliada = $_POST['conciliada'] ?? 'N';

    $fec_concilia = isset($_POST['fec_concilia']) && $_POST['fec_concilia'] !== ''
        ? $_POST['fec_concilia']
        : null;

    // CREAR
    if ($accion === 'crear') {
        $sql = "BEGIN insertar_transac_cta(
                    :p_tipo_transac_cta,
                    :p_id_cuenta_bco_origen,
                    :p_id_cuenta_bco_destino,
                    :p_moneda_transac_cta,
                    :p_monto_colones,
                    :p_monto_dolares,
                    :p_id_tip_cambio,
                    TO_DATE(:p_fec_transac_cta, 'YYYY-MM-DD'),
                    :p_conciliada,
                    TO_DATE(:p_fec_concilia, 'YYYY-MM-DD')
                ); END;";

        $stid = oci_parse($conn, $sql);

        oci_bind_by_name($stid, ":p_tipo_transac_cta", $tipo_transac_cta);
        oci_bind_by_name($stid, ":p_id_cuenta_bco_origen", $id_cuenta_bco_origen);
        oci_bind_by_name($stid, ":p_id_cuenta_bco_destino", $id_cuenta_bco_destino);
        oci_bind_by_name($stid, ":p_moneda_transac_cta", $moneda_transac_cta);
        oci_bind_by_name($stid, ":p_monto_colones", $monto_colones);
        oci_bind_by_name($stid, ":p_monto_dolares", $monto_dolares);
        oci_bind_by_name($stid, ":p_id_tip_cambio", $id_tip_cambio);
        oci_bind_by_name($stid, ":p_fec_transac_cta", $fec_transac_cta);
        oci_bind_by_name($stid, ":p_conciliada", $conciliada);
        oci_bind_by_name($stid, ":p_fec_concilia", $fec_concilia);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Transacción de cuenta agregada correctamente"]);
        }
        exit;
    }

    //ACTUALIZAR 
    if ($accion === 'actualizar') {
        if (!$id_transac_cta) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id de la transacción de cuenta para actualizar"]);
            exit;
        }

        $sql = "BEGIN actualizar_transac_cta(
                    :p_id_transac_cta,
                    :p_tipo_transac_cta,
                    :p_id_cuenta_bco_origen,
                    :p_id_cuenta_bco_destino,
                    :p_moneda_transac_cta,
                    :p_monto_colones,
                    :p_monto_dolares,
                    :p_id_tip_cambio,
                    TO_DATE(:p_fec_transac_cta, 'YYYY-MM-DD'),
                    :p_conciliada,
                    TO_DATE(:p_fec_concilia, 'YYYY-MM-DD')
                ); END;";

        $stid = oci_parse($conn, $sql);

        oci_bind_by_name($stid, ":p_id_transac_cta", $id_transac_cta);
        oci_bind_by_name($stid, ":p_tipo_transac_cta", $tipo_transac_cta);
        oci_bind_by_name($stid, ":p_id_cuenta_bco_origen", $id_cuenta_bco_origen);
        oci_bind_by_name($stid, ":p_id_cuenta_bco_destino", $id_cuenta_bco_destino);
        oci_bind_by_name($stid, ":p_moneda_transac_cta", $moneda_transac_cta);
        oci_bind_by_name($stid, ":p_monto_colones", $monto_colones);
        oci_bind_by_name($stid, ":p_monto_dolares", $monto_dolares);
        oci_bind_by_name($stid, ":p_id_tip_cambio", $id_tip_cambio);
        oci_bind_by_name($stid, ":p_fec_transac_cta", $fec_transac_cta);
        oci_bind_by_name($stid, ":p_conciliada", $conciliada);
        oci_bind_by_name($stid, ":p_fec_concilia", $fec_concilia);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Transacción de cuenta actualizada correctamente"]);
        }
        exit;
    }

    // ELIMINAR 
    if ($accion === 'eliminar') {
        if (!$id_transac_cta) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id de la transacción de cuenta para eliminar"]);
            exit;
        }

        $sql = "BEGIN eliminar_transac_cta(:p_id_transac_cta); END;";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_transac_cta", $id_transac_cta);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Transacción de cuenta eliminada correctamente"]);
        }
        exit;
    }

    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Acción no reconocida"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
