<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$usuario = "SYSTEM";
$clave   = "1234";
$bd      = "localhost/XE";

$conn = oci_connect($usuario, $clave, $bd);

if (!$conn) {
    $e = oci_error();
    echo json_encode(["ok" => false, "mensaje" => $e['message']]);
    exit;
}

$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo === "GET") {

    $sql = "SELECT ID_TIPO_PAGO, NOMBRE_TIPO, DESCRIPCION FROM TBL_TIPOS_PAGO ORDER BY ID_TIPO_PAGO ASC";
    $stid = oci_parse($conn, $sql);
    oci_execute($stid);

    $data = [];
    while ($row = oci_fetch_assoc($stid)) {
        $data[] = $row;
    }

    echo json_encode(["ok" => true, "data" => $data]);
    exit;
}

if ($metodo === "POST") {

    $body = json_decode(file_get_contents("php://input"), true);

    $nombre = $body["nombre_tipo"] ?? null;
    $desc   = $body["descripcion"] ?? null;

    if (!$nombre) {
        echo json_encode(["ok" => false, "mensaje" => "El nombre es obligatorio"]);
        exit;
    }

    $sql = "INSERT INTO TBL_TIPOS_PAGO (NOMBRE_TIPO, DESCRIPCION)
            VALUES (:nombre, :desc)";

    $stid = oci_parse($conn, $sql);
    oci_bind_by_name($stid, ":nombre", $nombre);
    oci_bind_by_name($stid, ":desc", $desc);

    if (oci_execute($stid)) {
        echo json_encode(["ok" => true, "mensaje" => "Tipo de pago registrado"]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "Error al registrar"]);
    }

    exit;
}

if ($metodo === "PUT") {

    $body = json_decode(file_get_contents("php://input"), true);

    $id     = $body["id_tipo_pago"] ?? null;
    $nombre = $body["nombre_tipo"] ?? null;
    $desc   = $body["descripcion"] ?? null;

    if (!$id) {
        echo json_encode(["ok" => false, "mensaje" => "ID requerido"]);
        exit;
    }

    $sql = "UPDATE TBL_TIPOS_PAGO
            SET NOMBRE_TIPO = :nombre,
                DESCRIPCION = :desc
            WHERE ID_TIPO_PAGO = :id";

    $stid = oci_parse($conn, $sql);
    oci_bind_by_name($stid, ":nombre", $nombre);
    oci_bind_by_name($stid, ":desc", $desc);
    oci_bind_by_name($stid, ":id", $id);

    if (oci_execute($stid)) {
        echo json_encode(["ok" => true, "mensaje" => "Tipo de pago actualizado"]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "Error al actualizar"]);
    }

    exit;
}

if ($metodo === "DELETE") {

    $body = json_decode(file_get_contents("php://input"), true);
    $id = $body["id_tipo_pago"] ?? null;

    if (!$id) {
        echo json_encode(["ok" => false, "mensaje" => "ID requerido"]);
        exit;
    }

    $sql = "DELETE FROM TBL_TIPOS_PAGO WHERE ID_TIPO_PAGO = :id";
    $stid = oci_parse($conn, $sql);
    oci_bind_by_name($stid, ":id", $id);

    if (oci_execute($stid)) {
        echo json_encode(["ok" => true, "mensaje" => "Tipo de pago eliminado"]);
    } else {
        echo json_encode(["ok" => false, "mensaje" => "Error al eliminar"]);
    }

    exit;
}

?>
