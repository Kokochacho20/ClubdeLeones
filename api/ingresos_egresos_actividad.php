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

    //devolver tipos de pago
    if (isset($_GET['tipos_pago'])) {

        $sql = "SELECT id_tip_pago, nombre_tip_pago
                FROM TIPO_PAGO
                ORDER BY nombre_tip_pago";

        $stid = oci_parse($conn, $sql);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
            exit;
        }

        $tipos = [];
        while ($row = oci_fetch_assoc($stid)) {
            $tipos[] = $row;
        }

        echo json_encode($tipos);
        exit;
    }

    //LISTADO TRANSACCIONES
    $sql = "SELECT 
                id_transaccion,
                id_activ_soc,
                TO_CHAR(fec_transaccion, 'YYYY-MM-DD') AS fec_transaccion,
                id_tip_pago,
                mes_pago,
                an_pago,
                moneda_transac,
                monto_colones,
                monto_dolares,
                id_tip_cambio
            FROM TRANSACCIONES
            ORDER BY id_transaccion";

    $stid = oci_parse($conn, $sql);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        exit;
    }

    $lista = [];
    while ($row = oci_fetch_assoc($stid)) {
        $lista[] = $row;
    }

    echo json_encode($lista);
    exit;
}


if ($method === 'POST') {

    $accion  = $_POST['accion'] ?? '';
    $id_transaccion  = $_POST['id_transaccion'] ?? null;
    $id_activ_soc = $_POST['id_activ_soc'] ?? null;
    $fec_transaccion = $_POST['fec_transaccion'] ?? null;
    $id_tip_pago = $_POST['id_tip_pago'] ?? null;
    $mes_pago = $_POST['mes_pago'] ?? null;
    $an_pago = $_POST['an_pago'] ?? null;
    $moneda_transac = $_POST['moneda_transac'] ?? 'C';
    $monto_colones = $_POST['monto_colones'] ?? null;
    $monto_dolares = $_POST['monto_dolares'] ?? null;
    $id_tip_cambio = $_POST['id_tip_cambio'] ?? null;

    //CREAR
    if ($accion === 'crear') {

        if (
            !$id_activ_soc || !$fec_transaccion || !$id_tip_pago ||
            !$mes_pago || !$an_pago || !$monto_colones || !$id_tip_cambio
        ) {

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
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
            exit;
        }

        echo json_encode(["ok" => true, "mensaje" => "Transacción registrada correctamente"]);
        exit;
    }

    // ACTUALIZAR
    if ($accion === 'actualizar') {

        if (!$id_transaccion) {
            echo json_encode(["ok" => false, "mensaje" => "ID requerido para actualizar"]);
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
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
            exit;
        }

        echo json_encode(["ok" => true, "mensaje" => "Transacción actualizada correctamente"]);
        exit;
    }

    // ELIMINAR 
    if ($accion === 'eliminar') {

        if (!$id_transaccion) {
            echo json_encode(["ok" => false, "mensaje" => "ID requerido para eliminar"]);
            exit;
        }

        $sql = "BEGIN eliminar_transaccion(:p_id_transaccion); END;";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_transaccion", $id_transaccion);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
            exit;
        }

        echo json_encode(["ok" => true, "mensaje" => "Transacción eliminada correctamente"]);
        exit;
    }

    echo json_encode(["ok" => false, "mensaje" => "Acción no reconocida"]);
    exit;




    
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
