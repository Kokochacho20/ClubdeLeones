<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn   = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // LISTAR Tipos de Actividad
    $sql = "SELECT id_tip_actividad,
                   nombre_tip_actividad,
                   tipo_actividad
            FROM tipo_actividad
            ORDER BY id_tip_actividad";

    $stid = oci_parse($conn, $sql);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        http_response_code(400);
        echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        exit;
    }

    $tipoactividades = [];
    while ($row = oci_fetch_assoc($stid)) {
        $tipoactividades[] = $row;
    }

    echo json_encode($tipoactividades);
    exit;
}

if ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $accion            = $data['accion'] ?? '';
    $id_tip_actividad  = $data['id_tip_actividad'] ?? null;
    $nombre            = $data['nombre_tip_actividad'] ?? null;
    $tipo              = $data['tipo_actividad'] ?? null;

    // INSERTAR TIPO DE ACTIVIDAD
    if ($accion === 'crear') {

        if (!$nombre || !$tipo) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Faltan datos obligatorios"]);
            exit;
        }

        $sql = "BEGIN insertar_tipo_actividad(
                    :p_nombre_tip_actividad,
                    :p_tipo_actividad
                ); END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_nombre_tip_actividad", $nombre);
        oci_bind_by_name($stid, ":p_tipo_actividad", $tipo);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Tipo de actividad agregado correctamente"]);
        }
        exit;
    }

    // ACTUALIZAR TIPO DE ACTIVIDAD
    if ($accion === 'actualizar') {

        if (!$id_tip_actividad) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id del tipo de actividad para actualizar"]);
            exit;
        }

        if (!$nombre || !$tipo) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Faltan datos obligatorios"]);
            exit;
        }

        $sql = "BEGIN actualizar_tipo_actividad(
                    :p_id_tip_actividad,
                    :p_nombre_tip_actividad,
                    :p_tipo_actividad
                ); END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_tip_actividad", $id_tip_actividad);
        oci_bind_by_name($stid, ":p_nombre_tip_actividad", $nombre);
        oci_bind_by_name($stid, ":p_tipo_actividad", $tipo);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Tipo de actividad actualizado correctamente"]);
        }
        exit;
    }

    // ELIMINAR TIPO DE ACTIVIDAD
    if ($accion === 'eliminar') {

        if (!$id_tip_actividad) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id del tipo de actividad para eliminar"]);
            exit;
        }

        $sql = "BEGIN eliminar_tipo_actividad(:p_id_tip_actividad); END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_tip_actividad", $id_tip_actividad);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Tipo de actividad eliminado correctamente"]);
        }
        exit;
    }

    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Accion no reconocida"]);
    exit;
}
http_response_code(405);
echo json_encode(["error" => "Metodo no permitido"]);
