<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // LISTAR Provincias
    $sql = "SELECT cod_provincia,
                   nombre_provincia
            FROM provincias
            ORDER BY cod_provincia";

    $stid = oci_parse($conn, $sql);
    oci_execute($stid);

    $distritos = [];
    while ($row = oci_fetch_assoc($stid)) {
        $provincias[] = $row;
    }

    echo json_encode($provincias);
    exit;
}

if ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $accion        = $data['accion'] ?? '';
    $cod_provincia = $data['cod_provincia'] ?? null;
    $nombre        = $data['nombre_provincia'] ?? null;

    //insertar provincia
    if ($accion === 'crear') {
        $sql = "BEGIN insertar_provincia(:p_cod_provincia,
                                        :p_nombre); 
                END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_cod_provincia", $cod_provincia);
        oci_bind_by_name($stid, ":p_nombre", $nombre);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Provincia agregada correctamente"]);
        }
        exit;
    }

    //actualizar 
    if ($accion === 'actualizar') {

        if (!$cod_provincia) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el código de la provincia para actualizar"]);
            exit;a
        }

        $sql = "BEGIN actualizar_provincia(:p_cod_provincia,
                                         :p_nombre); 
                END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_cod_provincia", $cod_provincia);
        oci_bind_by_name($stid, ":p_nombre", $nombre);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Provincia actualizada correctamente"]);
        }
        exit;
    }

    //eliminar
    if ($accion === 'eliminar') {

        if (!$cod_provincia) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el código de la provincia para eliminar"]);
            exit;
        }

        $sql = "BEGIN eliminar_provincia(:p_cod_provincia); END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_cod_provincia", $cod_provincia);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Provincia eliminada correctamente"]);
        }
        exit;
    }

    //errores 
    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Acción no reconocida"]);
    exit;
}
http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
