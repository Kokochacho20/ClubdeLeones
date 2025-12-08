<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn   = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // LISTAR Cuentas Bancarias
    $sql = "SELECT c.id_cuenta_bco,
                   c.nombre_cuenta_bco,
                   c.id_banco,
                   b.nombre_banco,
                   c.moneda_cuenta_bco,
                   c.fec_corte,
                   c.saldo_corte
            FROM cuentas_bancarias c
            JOIN bancos b ON c.id_banco = b.id_banco
            ORDER BY c.id_cuenta_bco";

    $stid = oci_parse($conn, $sql);

    if (!@oci_execute($stid)) {
        $e = oci_error($stid);
        http_response_code(500);
        echo json_encode([
            "ok" => false,
            "mensaje" => $e['message']
        ]);
        exit;
    }

    $cuentas = [];
    while ($row = oci_fetch_assoc($stid)) {
        $cuentas[] = $row; // claves en MAYÚSCULA
    }

    echo json_encode($cuentas);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $accion = $data['accion'] ?? '';
    $id_cuenta_bco = $data['id_cuenta_bco'] ?? null;
    $nombre_cuenta_bco = $data['nombre_cuenta_bco'] ?? null;
    $id_banco  = $data['id_banco']  ?? null;
    $moneda_cuenta_bco = $data['moneda_cuenta_bco'] ?? 'C';
    $fec_corte = $data['fec_corte'] ?? null;
    $saldo_corte = $data['saldo_corte'] ?? null;

    // Normalizar vacíos
    if ($fec_corte === '')  $fec_corte  = null;
    if ($saldo_corte === '') $saldo_corte = null;

    // INSERTAR
    if ($accion === 'crear') {

        if (!$nombre_cuenta_bco || !$id_banco || !$moneda_cuenta_bco) {
            http_response_code(400);
            echo json_encode([
                "ok"      => false,
                "mensaje" => "Nombre de cuenta, banco y moneda son obligatorios"
            ]);
            exit;
        }

        $sql = "BEGIN insertar_cuenta_bancaria(
            :p_nombre_cuenta_bco,
            :p_id_banco,
            :p_moneda_cuenta_bco,
            TO_DATE(:p_fec_corte, 'YYYY-MM-DD'),
            :p_saldo_corte
        ); END;";


        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_nombre_cuenta_bco", $nombre_cuenta_bco);
        oci_bind_by_name($stid, ":p_id_banco", $id_banco);
        oci_bind_by_name($stid, ":p_moneda_cuenta_bco", $moneda_cuenta_bco);
        oci_bind_by_name($stid, ":p_fec_corte", $fec_corte);
        oci_bind_by_name($stid, ":p_saldo_corte", $saldo_corte);

        if (!@oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "mensaje" => $e['message']
            ]);
        } else {
            echo json_encode([
                "ok" => true,
                "mensaje" => "Cuenta bancaria agregada correctamente"
            ]);
        }
        exit;
    }

    // ACTUALIZAR
    if ($accion === 'actualizar') {

        if (!$id_cuenta_bco) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "mensaje" => "Falta el id de la cuenta bancaria para actualizar"
            ]);
            exit;
        }

        if (!$nombre_cuenta_bco || !$id_banco || !$moneda_cuenta_bco) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "mensaje" => "Nombre de cuenta, banco y moneda son obligatorios"
            ]);
            exit;
        }

        $sql = "BEGIN actualizar_cuenta_bancaria(
            :p_id_cuenta_bco,
            :p_nombre_cuenta_bco,
            :p_id_banco,
            :p_moneda_cuenta_bco,
            TO_DATE(:p_fec_corte, 'YYYY-MM-DD'),
            :p_saldo_corte
        ); END;";


        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_cuenta_bco", $id_cuenta_bco);
        oci_bind_by_name($stid, ":p_nombre_cuenta_bco", $nombre_cuenta_bco);
        oci_bind_by_name($stid, ":p_id_banco",  $id_banco);
        oci_bind_by_name($stid, ":p_moneda_cuenta_bco", $moneda_cuenta_bco);
        oci_bind_by_name($stid, ":p_fec_corte", $fec_corte);
        oci_bind_by_name($stid, ":p_saldo_corte", $saldo_corte);

        if (!@oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "mensaje" => $e['message']
            ]);
        } else {
            echo json_encode([
                "ok" => true,
                "mensaje" => "Cuenta bancaria actualizada correctamente"
            ]);
        }
        exit;
    }

    // ELIMINAR
    if ($accion === 'eliminar') {

        if (!$id_cuenta_bco) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "mensaje" => "Falta el id de la cuenta bancaria para eliminar"
            ]);
            exit;
        }

        $sql = "BEGIN eliminar_cuenta_bancaria(:p_id_cuenta_bco); END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_cuenta_bco", $id_cuenta_bco);

        if (!@oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "mensaje" => $e['message']
            ]);
        } else {
            echo json_encode([
                "ok" => true,
                "mensaje" => "Cuenta bancaria eliminada correctamente"
            ]);
        }
        exit;
    }

    // ACCIÓN NO RECONOCIDA
    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Acción no reconocida"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
