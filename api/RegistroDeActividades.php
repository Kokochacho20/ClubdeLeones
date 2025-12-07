<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {

    $sql = "SELECT 
                id_actividad AS ID_ACTIVIDAD,
                nombre_actividad AS NOMBRE_ACTIVIDAD,
                descripcion AS DESCRIPCION,
                fecha_actividad AS FECHA_ACTIVIDAD,
                lugar AS LUGAR,
                estado AS ESTADO
            FROM actividades
            ORDER BY id_actividad";

    $stid = oci_parse($conn, $sql);
    oci_execute($stid);

    $listado = [];
    while ($fila = oci_fetch_assoc($stid)) {
        $listado[] = $fila;
    }

    echo json_encode($listado);
    exit;
}

if ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $nombre = $data['nombre_actividad'] ?? null;
    $desc   = $data['descripcion'] ?? null;
    $fecha  = $data['fecha_actividad'] ?? null;
    $lugar  = $data['lugar'] ?? null;
    $estado = $data['estado'] ?? 'A';

    if (!$nombre || !$fecha) {
        echo json_encode(["ok" => false, "mensaje" => "Faltan datos obligatorios"]);
        exit;
    }

    $sql = "INSERT INTO actividades(
                nombre_actividad,
                descripcion,
                fecha_actividad,
                lugar,
                estado
            ) VALUES (
                :nombre,
                :desc,
                TO_DATE(:fecha, 'YYYY-MM-DD'),
                :lugar,
                :estado
            )";

    $stid = oci_parse($conn, $sql);

    oci_bind_by_name($stid, ":nombre", $nombre);
    oci_bind_by_name($stid, ":desc", $desc);
    oci_bind_by_name($stid, ":fecha", $fecha);
    oci_bind_by_name($stid, ":lugar", $lugar);
    oci_bind_by_name($stid, ":estado", $estado);

    if (oci_execute($stid)) {
        oci_commit($conn);
        echo json_encode(["ok" => true, "mensaje" => "Actividad registrada"]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "Error al registrar"]);
    }

    exit;
}

if ($method === 'PUT') {

    $data = json_decode(file_get_contents("php://input"), true);

    $id     = $data['id_actividad'] ?? null;
    $nombre = $data['nombre_actividad'] ?? null;
    $desc   = $data['descripcion'] ?? null;
    $fecha  = $data['fecha_actividad'] ?? null;
    $lugar  = $data['lugar'] ?? null;
    $estado = $data['estado'] ?? null;

    if (!$id) {
        echo json_encode(["ok" => false, "mensaje" => "Falta el ID"]);
        exit;
    }

    $sql = "UPDATE actividades
            SET nombre_actividad = :nombre,
                descripcion = :desc,
                fecha_actividad = TO_DATE(:fecha, 'YYYY-MM-DD'),
                lugar = :lugar,
                estado = :estado
            WHERE id_actividad = :id";

    $stid = oci_parse($conn, $sql);

    oci_bind_by_name($stid, ":nombre", $nombre);
    oci_bind_by_name($stid, ":desc", $desc);
    oci_bind_by_name($stid, ":fecha", $fecha);
    oci_bind_by_name($stid, ":lugar", $lugar);
    oci_bind_by_name($stid, ":estado", $estado);
    oci_bind_by_name($stid, ":id", $id);

    if (oci_execute($stid)) {
        oci_commit($conn);
        echo json_encode(["ok" => true, "mensaje" => "Actividad actualizada"]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "Error al actualizar"]);
    }

    exit;
}

if ($method === 'DELETE') {

    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id_actividad'] ?? null;

    if (!$id) {
        echo json_encode(["ok" => false, "mensaje" => "Falta el ID"]);
        exit;
    }

    $sql = "DELETE FROM actividades WHERE id_actividad = :id";

    $stid = oci_parse($conn, $sql);
    oci_bind_by_name($stid, ":id", $id);

    if (oci_execute($stid)) {
        oci_commit($conn);
        echo json_encode(["ok" => true, "mensaje" => "Actividad eliminada"]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "Error al eliminar"]);
    }

    exit;
}

echo json_encode(["error" => "Método no permitido"]);
