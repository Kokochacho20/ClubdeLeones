<?php 
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {

    $sql = "SELECT 
                id_socio,
                nombre_socio,
                TO_CHAR(fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento,
                TO_CHAR(fecha_ingreso, 'YYYY-MM-DD') AS fecha_ingreso,
                numero_socio,
                cod_distrito,
                desc_direccion,
                telefono1,
                telefono2,
                tipo_socio,
                estado_socio
            FROM SOCIOS
            ORDER BY id_socio";

    $stid = oci_parse($conn, $sql);
    oci_execute($stid);

    $socios = [];
    while ($row = oci_fetch_assoc($stid)) {
        $socios[] = $row;
    }

    echo json_encode(["ok" => true, "data" => $socios]);
    exit;
}

if ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $nombre_socio     = $data['nombre_socio'] ?? null;
    $fecha_nacimiento = $data['fecha_nacimiento'] ?? null;
    $fecha_ingreso    = $data['fecha_ingreso'] ?? null;
    $numero_socio     = $data['numero_socio'] ?? null;
    $cod_distrito     = $data['cod_distrito'] ?? null;
    $desc_direccion   = $data['desc_direccion'] ?? null;
    $telefono1        = $data['telefono1'] ?? null;
    $telefono2        = $data['telefono2'] ?? null;
    $tipo_socio       = $data['tipo_socio'] ?? null;
    $estado_socio     = $data['estado_socio'] ?? 'A';

    if (!$nombre_socio || !$cod_distrito) {
        http_response_code(400);
        echo json_encode(["ok" => false, "mensaje" => "Faltan datos obligatorios"]);
        exit;
    }

    $sql = "BEGIN insertar_socio(
                :p_nombre_socio,
                TO_DATE(:p_fecha_nacimiento, 'YYYY-MM-DD'),
                TO_DATE(:p_fecha_ingreso, 'YYYY-MM-DD'),
                :p_numero_socio,
                :p_cod_distrito,
                :p_desc_direccion,
                :p_telefono1,
                :p_telefono2,
                :p_tipo_socio,
                :p_estado_socio
            ); END;";

    $stid = oci_parse($conn, $sql);

    oci_bind_by_name($stid, ":p_nombre_socio", $nombre_socio);
    oci_bind_by_name($stid, ":p_fecha_nacimiento", $fecha_nacimiento);
    oci_bind_by_name($stid, ":p_fecha_ingreso", $fecha_ingreso);
    oci_bind_by_name($stid, ":p_numero_socio", $numero_socio);
    oci_bind_by_name($stid, ":p_cod_distrito", $cod_distrito);
    oci_bind_by_name($stid, ":p_desc_direccion", $desc_direccion);
    oci_bind_by_name($stid, ":p_telefono1", $telefono1);
    oci_bind_by_name($stid, ":p_telefono2", $telefono2);
    oci_bind_by_name($stid, ":p_tipo_socio", $tipo_socio);
    oci_bind_by_name($stid, ":p_estado_socio", $estado_socio);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        echo json_encode(["ok" => false, "mensaje" => $e["message"]]);
    } else {
        oci_commit($conn);
        echo json_encode(["ok" => true, "mensaje" => "Socio registrado correctamente"]);
    }

    exit;
}

if ($method === 'PUT') {

    $data = json_decode(file_get_contents("php://input"), true);

    $id_socio = $data['id_socio'] ?? null;
    if (!$id_socio) {
        echo json_encode(["ok" => false, "mensaje" => "Falta el ID del socio"]);
        exit;
    }

    $nombre_socio     = $data['nombre_socio'] ?? null;
    $fecha_nacimiento = $data['fecha_nacimiento'] ?? null;
    $fecha_ingreso    = $data['fecha_ingreso'] ?? null;
    $numero_socio     = $data['numero_socio'] ?? null;
    $cod_distrito     = $data['cod_distrito'] ?? null;
    $desc_direccion   = $data['desc_direccion'] ?? null;
    $telefono1        = $data['telefono1'] ?? null;
    $telefono2        = $data['telefono2'] ?? null;
    $tipo_socio       = $data['tipo_socio'] ?? null;
    $estado_socio     = $data['estado_socio'] ?? null;

    $sql = "BEGIN actualizar_socio(
                :p_id_socio,
                :p_nombre_socio,
                TO_DATE(:p_fecha_nacimiento, 'YYYY-MM-DD'),
                TO_DATE(:p_fecha_ingreso, 'YYYY-MM-DD'),
                :p_numero_socio,
                :p_cod_distrito,
                :p_desc_direccion,
                :p_telefono1,
                :p_telefono2,
                :p_tipo_socio,
                :p_estado_socio
            ); END;";

    $stid = oci_parse($conn, $sql);

    oci_bind_by_name($stid, ":p_id_socio", $id_socio);
    oci_bind_by_name($stid, ":p_nombre_socio", $nombre_socio);
    oci_bind_by_name($stid, ":p_fecha_nacimiento", $fecha_nacimiento);
    oci_bind_by_name($stid, ":p_fecha_ingreso", $fecha_ingreso);
    oci_bind_by_name($stid, ":p_numero_socio", $numero_socio);
    oci_bind_by_name($stid, ":p_cod_distrito", $cod_distrito);
    oci_bind_by_name($stid, ":p_desc_direccion", $desc_direccion);
    oci_bind_by_name($stid, ":p_telefono1", $telefono1);
    oci_bind_by_name($stid, ":p_telefono2", $telefono2);
    oci_bind_by_name($stid, ":p_tipo_socio", $tipo_socio);
    oci_bind_by_name($stid, ":p_estado_socio", $estado_socio);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        echo json_encode(["ok" => false, "mensaje" => $e["message"]]);
    } else {
        oci_commit($conn);
        echo json_encode(["ok" => true, "mensaje" => "Socio actualizado correctamente"]);
    }

    exit;
}

if ($method === 'DELETE') {

    $data = json_decode(file_get_contents("php://input"), true);
    $id_socio = $data['id_socio'] ?? null;

    if (!$id_socio) {
        echo json_encode(["ok" => false, "mensaje" => "Falta el ID del socio"]);
        exit;
    }

    $sql = "BEGIN eliminar_socio(:p_id_socio); END;";
    $stid = oci_parse($conn, $sql);
    oci_bind_by_name($stid, ":p_id_socio", $id_socio);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        echo json_encode(["ok" => false, "mensaje" => $e["message"]]);
    } else {
        oci_commit($conn);
        echo json_encode(["ok" => true, "mensaje" => "Socio eliminado correctamente"]);
    }

    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);



