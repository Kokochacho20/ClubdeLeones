<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // LISTAR Bancos
    $sql = "SELECT id_banco,
                   nombre_banco,
                   tel_banco1,
                   tel_banco2,
                   contacto_banco1,
                   contacto_banco2
            FROM bancos
            ORDER BY id_banco";

    $stid = oci_parse($conn, $sql);
    oci_execute($stid);

    $bancos = [];
    while ($row = oci_fetch_assoc($stid)) {
        $bancos[] = $row;
    }

    echo json_encode($bancos);
    exit;
}

if ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $accion          = $data['accion'] ?? '';
    $id_banco        = $data['id_banco'] ?? null;
    $nombre_banco    = $data['nombre_banco'] ?? null;
    $tel_banco1      = $data['tel_banco1'] ?? null;
    $tel_banco2      = $data['tel_banco2'] ?? null;
    $contacto_banco1 = $data['contacto_banco1'] ?? null;
    $contacto_banco2 = $data['contacto_banco2'] ?? null;

    // insertar banco
    if ($accion === 'crear') {
        $sql = "BEGIN insertar_banco(:p_id_banco,
                                     :p_nombre_banco,
                                     :p_tel_banco1,
                                     :p_tel_banco2,
                                     :p_contacto_banco1,
                                     :p_contacto_banco2); 
                END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_banco", $id_banco);
        oci_bind_by_name($stid, ":p_nombre_banco", $nombre_banco);
        oci_bind_by_name($stid, ":p_tel_banco1", $tel_banco1);
        oci_bind_by_name($stid, ":p_tel_banco2", $tel_banco2);
        oci_bind_by_name($stid, ":p_contacto_banco1", $contacto_banco1);
        oci_bind_by_name($stid, ":p_contacto_banco2", $contacto_banco2);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Banco agregado correctamente"]);
        }
        exit;
    }

    // actualizar banco
    if ($accion === 'actualizar') {

        if (!$id_banco) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id del banco para actualizar"]);
            exit;
        }

        $sql = "BEGIN actualizar_banco(:p_id_banco,
                                       :p_nombre_banco,
                                       :p_tel_banco1,
                                       :p_tel_banco2,
                                       :p_contacto_banco1,
                                       :p_contacto_banco2); 
                END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_banco", $id_banco);
        oci_bind_by_name($stid, ":p_nombre_banco", $nombre_banco);
        oci_bind_by_name($stid, ":p_tel_banco1", $tel_banco1);
        oci_bind_by_name($stid, ":p_tel_banco2", $tel_banco2);
        oci_bind_by_name($stid, ":p_contacto_banco1", $contacto_banco1);
        oci_bind_by_name($stid, ":p_contacto_banco2", $contacto_banco2);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Banco actualizado correctamente"]);
        }
        exit;
    }

    // eliminar banco
    if ($accion === 'eliminar') {

        if (!$id_banco) {
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => "Falta el id del banco para eliminar"]);
            exit;
        }

        $sql = "BEGIN eliminar_banco(:p_id_banco); END;";

        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_banco", $id_banco);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(400);
            echo json_encode(["ok" => false, "mensaje" => $e['message']]);
        } else {
            echo json_encode(["ok" => true, "mensaje" => "Banco eliminado correctamente"]);
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
