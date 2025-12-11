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
    $sql = "SELECT 
                id_actividad,
                nombre_actividad,
                id_tip_actividad,
                TO_CHAR(fecha_actividad, 'YYYY-MM-DD') AS fecha_actividad,
                lugar_actividad,
                TO_CHAR(hora_actividad, 'HH24:MI') AS hora_actividad,
                id_tip_pago,
                descrip_actividad,
                costo_actividad,
                moneda_actividad,
                id_cuenta_bco
            FROM ACTIVIDADES
            ORDER BY id_actividad";

    $stid = oci_parse($conn, $sql);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        http_response_code(500);
        echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        exit;
    }

    $actividades = [];
    while ($row = oci_fetch_assoc($stid)) {
        $actividades[] = $row;
    }

    echo json_encode($actividades);
    exit;
}



if ($method === 'POST') {

    $accion = $_POST['accion'] ?? '';

    // Campos del formulario
    $id_actividad = $_POST['id_actividad'] ?? null;
    $nombre_actividad = $_POST['nombre_actividad'] ?? null;
    $id_tip_actividad = $_POST['id_tip_actividad'] ?? null;
    $fecha_actividad = $_POST['fecha_actividad'] ?? null;
    $lugar_actividad = $_POST['lugar_actividad'] ?? null;
    $hora_actividad = $_POST['hora_actividad'] ?? null;
    $id_tip_pago = $_POST['id_tip_pago'] ?? null;
    $descrip_actividad = $_POST['descrip_actividad'] ?? null;
    $costo_actividad = $_POST['costo_actividad'] ?? null;
    $moneda_actividad = $_POST['moneda_actividad'] ?? null;
    $id_cuenta_bco = $_POST['id_cuenta_bco'] ?? null;

    //CREAR 
    if ($accion === 'crear') {
        $sql = "BEGIN insertar_actividad(
                    :p_nombre_actividad,
                    :p_id_tip_actividad,
                    TO_DATE(:p_fecha_actividad, 'YYYY-MM-DD'),
                    :p_lugar_actividad,
                    TO_DATE(:p_hora_actividad, 'HH24:MI'),
                    :p_id_tip_pago,
                    :p_descrip_actividad,
                    :p_costo_actividad,
                    :p_moneda_actividad,
                    :p_id_cuenta_bco
                ); END;";

        $stid = oci_parse($conn, $sql);

        oci_bind_by_name($stid, ":p_nombre_actividad", $nombre_actividad);
        oci_bind_by_name($stid, ":p_id_tip_actividad", $id_tip_actividad);
        oci_bind_by_name($stid, ":p_fecha_actividad", $fecha_actividad);
        oci_bind_by_name($stid, ":p_lugar_actividad", $lugar_actividad);
        oci_bind_by_name($stid, ":p_hora_actividad", $hora_actividad);
        oci_bind_by_name($stid, ":p_id_tip_pago", $id_tip_pago);
        oci_bind_by_name($stid, ":p_descrip_actividad", $descrip_actividad);
        oci_bind_by_name($stid, ":p_costo_actividad", $costo_actividad);
        oci_bind_by_name($stid, ":p_moneda_actividad", $moneda_actividad);
        oci_bind_by_name($stid, ":p_id_cuenta_bco", $id_cuenta_bco);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Actividad creada correctamente"]);
        }

        exit;
    }

    // ACTUALIZAR
    if ($accion === 'actualizar') {

        if (!$id_actividad) {
            echo json_encode(["ok" => false, "mensaje" => "Falta el ID de la actividad"]);
            exit;
        }

        $sql = "BEGIN actualizar_actividad(
                    :p_id_actividad,
                    :p_nombre_actividad,
                    :p_id_tip_actividad,
                    TO_DATE(:p_fecha_actividad, 'YYYY-MM-DD'),
                    :p_lugar_actividad,
                    TO_DATE(:p_hora_actividad, 'HH24:MI'),
                    :p_id_tip_pago,
                    :p_descrip_actividad,
                    :p_costo_actividad,
                    :p_moneda_actividad,
                    :p_id_cuenta_bco
                ); END;";

        $stid = oci_parse($conn, $sql);

        oci_bind_by_name($stid, ":p_id_actividad", $id_actividad);
        oci_bind_by_name($stid, ":p_nombre_actividad", $nombre_actividad);
        oci_bind_by_name($stid, ":p_id_tip_actividad", $id_tip_actividad);
        oci_bind_by_name($stid, ":p_fecha_actividad", $fecha_actividad);
        oci_bind_by_name($stid, ":p_lugar_actividad", $lugar_actividad);
        oci_bind_by_name($stid, ":p_hora_actividad", $hora_actividad);
        oci_bind_by_name($stid, ":p_id_tip_pago", $id_tip_pago);
        oci_bind_by_name($stid, ":p_descrip_actividad", $descrip_actividad);
        oci_bind_by_name($stid, ":p_costo_actividad", $costo_actividad);
        oci_bind_by_name($stid, ":p_moneda_actividad", $moneda_actividad);
        oci_bind_by_name($stid, ":p_id_cuenta_bco", $id_cuenta_bco);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Actividad actualizada correctamente"]);
        }

        exit;
    }

    //ELIMINAR
    if ($accion === 'eliminar') {

        if (!$id_actividad) {
            echo json_encode(["ok" => false, "mensaje" => "Falta el ID de la actividad para eliminar"]);
            exit;
        }

        $sql = "BEGIN eliminar_actividad(:p_id_actividad); END;";
        $stid = oci_parse($conn, $sql);

        oci_bind_by_name($stid, ":p_id_actividad", $id_actividad);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Actividad eliminada correctamente"]);
        }

        exit;
    }

    echo json_encode(["ok" => false, "mensaje" => "Acción no válida"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
