<?php
header("Content-Type: application/json");
require_once "db.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':

        $sql = "
            SELECT 
                ID_ACTIVIDAD,
                FECHA_ACTIVIDAD,
                ID_SOCIO,
                ID_TIP_ACTIVIDAD,
                DESCRIP_ACTIVIDAD,
                LUGAR_ACTIVIDAD,
                HORA_ACTIVIDAD,
                COSTO_ACTIVIDAD,
                MONEDA_ACTIVIDAD,
                ID_TIP_PAGO,
                ID_CUENTA_BCO
            FROM REGISTRO_ACTIVIDADES
            ORDER BY FECHA_ACTIVIDAD DESC
        ";

        $stmt = oci_parse($conn, $sql);

        if (!oci_execute($stmt)) {
            echo json_encode([]);
            exit;
        }

        $result = [];
        while ($row = oci_fetch_assoc($stmt)) {
            $result[] = $row;
        }

        echo json_encode($result);
        break;

        case 'POST':

        $data = json_decode(file_get_contents("php://input"), true);

        $sql = "
            INSERT INTO REGISTRO_ACTIVIDADES
            (FECHA_ACTIVIDAD, ID_SOCIO, ID_TIP_ACTIVIDAD, DESCRIP_ACTIVIDAD,
             LUGAR_ACTIVIDAD, HORA_ACTIVIDAD, COSTO_ACTIVIDAD, MONEDA_ACTIVIDAD,
             ID_TIP_PAGO, ID_CUENTA_BCO)
            VALUES
            (:fec, :socio, :tipo, :desc, :lugar, :hora, :costo, :mon, :pago, :cuenta)
        ";

        $stmt = oci_parse($conn, $sql);

        oci_bind_by_name($stmt, ":fec",    $data["fecha_actividad"]);
        oci_bind_by_name($stmt, ":socio",  $data["id_socio"]);
        oci_bind_by_name($stmt, ":tipo",   $data["id_tip_actividad"]);
        oci_bind_by_name($stmt, ":desc",   $data["descripcion"]);
        oci_bind_by_name($stmt, ":lugar",  $data["lugar"]);
        oci_bind_by_name($stmt, ":hora",   $data["hora"]);
        oci_bind_by_name($stmt, ":costo",  $data["costo"]);
        oci_bind_by_name($stmt, ":mon",    $data["moneda"]);
        oci_bind_by_name($stmt, ":pago",   $data["id_tip_pago"]);
        oci_bind_by_name($stmt, ":cuenta", $data["id_cuenta_bco"]);

        $ok = oci_execute($stmt, OCI_NO_AUTO_COMMIT);

        if ($ok) {
            oci_commit($conn);
            echo json_encode(["status" => "success"]);
        } else {
            oci_rollback($conn);
            echo json_encode(["status" => "error"]);
        }

        break;

    default:
        echo json_encode(["error" => "Método no permitido"]);
        break;
}

oci_close($conn);
?>