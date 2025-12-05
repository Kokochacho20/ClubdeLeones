<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // LISTAR Cuentas Bancarias
    $sql = "SELECT id_cuenta_bco,
                   nombre_cuenta_bco,
                   id_banco,
                   moneda_cuenta_bco,
                   fec_corte,
                   saldo_corte
            FROM cuentas_bancarias
            ORDER BY id_cuenta_bco";

    $stid = oci_parse($conn, $sql);
    oci_execute($stid);

    $cuentas = [];
    while ($row = oci_fetch_assoc($stid)) {
        $cuentas[] = $row;
    }

    echo json_encode($cuentas);
    exit;
}

if ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $accion             = $data['accion'] ?? '';
    $id_cuenta_bco      = $data['id_cuenta_bco'] ?? null;
    $nombre_cuenta_bco  = $data['nombre_cuenta_bco'] ?? null;
    $id_banco           = $data['id_banco'] ?? null;
    $moneda_cuenta_bco  = $data['moneda_cuenta_bco'] ?? 'C';
    $fec_corte          = $data['fec_corte'] ?? null;
    $saldo_corte        = $data['saldo_corte'] ?? null;

    // insertar cuenta bancaria
    if ($accion === 'crear') {
        $sql = "BEGIN insertar_cuenta_bancaria(:p_id_cuenta_bco,
                                               :p_nombre_cuenta_bco,
                                               :p_id_banco,
                                               :p_moneda_cuenta_bco,
                                               :p_fec_corte,
                                               :p_saldo_corte); 
                END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_cuenta_bco", $id_cuenta_bco);
        oci_bind_by_name($stid, ":p_nombre_cuenta_bco", $nombre_cuenta_bco);
        oci_bind_by_name($stid, ":p_id_banco", $id_banco);
        oci_bind_by_name($stid, ":p_moneda_cuenta_bco", $moneda_cuenta_bco);
        oci_bind_by_name($stid, ":p_fec_corte", $fec_corte);
        oci_bind_by_name($stid, ":p_saldo_corte", $saldo_corte);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Cuenta bancaria agregada correctamente"]);
        }
        exit;
    }

    // actualizar cuenta bancaria
    if ($accion === 'actualizar') {

        if (!$id_cuenta_bco) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id de la cuenta bancaria para actualizar"]);
            exit;
        }

        $sql = "BEGIN actualizar_cuenta_bancaria(:p_id_cuenta_bco,
                                                 :p_nombre_cuenta_bco,
                                                 :p_id_banco,
                                                 :p_moneda_cuenta_bco,
                                                 :p_fec_corte,
                                                 :p_saldo_corte); 
                END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_cuenta_bco", $id_cuenta_bco);
        oci_bind_by_name($stid, ":p_nombre_cuenta_bco", $nombre_cuenta_bco);
        oci_bind_by_name($stid, ":p_id_banco", $id_banco);
        oci_bind_by_name($stid, ":p_moneda_cuenta_bco", $moneda_cuenta_bco);
        oci_bind_by_name($stid, ":p_fec_corte", $fec_corte);
        oci_bind_by_name($stid, ":p_saldo_corte", $saldo_corte);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Cuenta bancaria actualizada correctamente"]);
        }
        exit;
    }

    // eliminar cuenta bancaria
    if ($accion === 'eliminar') {

        if (!$id_cuenta_bco) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id de la cuenta bancaria para eliminar"]);
            exit;
        }

        $sql = "BEGIN eliminar_cuenta_bancaria(:p_id_cuenta_bco); END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_cuenta_bco", $id_cuenta_bco);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Cuenta bancaria eliminada correctamente"]);
        }
        exit;
    }

    // errores
    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Acción no reconocida"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
