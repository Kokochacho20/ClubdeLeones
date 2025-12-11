<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT d.cod_distrito,
               d.cod_provincia,
               d.cod_canton,
               d.nombre_distrito,
               c.nombre_canton
        FROM distritos d
        JOIN cantones c ON d.cod_canton = c.cod_canton
        ORDER BY d.cod_distrito";

    $stid = oci_parse($conn, $sql);
    oci_execute($stid);

    $distritos = [];
    while ($row = oci_fetch_assoc($stid)) {
        $distritos[] = $row;
    }

    echo json_encode($distritos);
    exit;
}

if ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $accion = $data['accion'] ?? '';
    $cod_distrito  = $data['cod_distrito'] ?? null;
    $cod_provincia = $data['cod_provincia'] ?? null;
    $cod_canton = $data['cod_canton'] ?? null;
    $nombre = $data['nombre_distrito'] ?? null;

    //insertar distrito 
    if ($accion === 'crear') {
        $sql = "BEGIN insertar_distrito(:p_cod_provincia,
                                        :p_cod_canton,
                                        :p_nombre); 
                END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_cod_provincia", $cod_provincia);
        oci_bind_by_name($stid, ":p_cod_canton", $cod_canton);
        oci_bind_by_name($stid, ":p_nombre", $nombre);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Distrito agregado correctamente"]);
        }
        exit;
    }

    //actualizar 
    if ($accion === 'actualizar') {

        if (!$cod_distrito) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el codigo del distrito para actualizar"]);
            exit;
        }

        $sql = "BEGIN actualizar_distrito(:p_cod_distrito,
                                         :p_cod_provincia,
                                         :p_cod_canton,
                                         :p_nombre); 
                END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_cod_distrito", $cod_distrito);
        oci_bind_by_name($stid, ":p_cod_provincia", $cod_provincia);
        oci_bind_by_name($stid, ":p_cod_canton", $cod_canton);
        oci_bind_by_name($stid, ":p_nombre", $nombre);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Distrito actualizado correctamente"]);
        }
        exit;
    }

    //eliminar
    if ($accion === 'eliminar') {

        if (!$cod_distrito) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el codigo del distrito para eliminar"]);
            exit;
        }

        $sql = "BEGIN eliminar_distrito(:p_cod_distrito); END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_cod_distrito", $cod_distrito);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Distrito eliminado correctamente"]);
        }
        exit;
    }

    //errores 
    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Acción no reconocida"]);
    exit;
}
http_response_code(405);
echo json_encode(["error" => "Metodo no permitido"]);
