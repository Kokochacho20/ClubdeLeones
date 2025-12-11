<?php
header("Content-Type: application/json; charset=utf-8");
require_once "db.php";

$method = $_SERVER['REQUEST_METHOD'];

function getJsonBody() {
    $raw = file_get_contents("php://input");
    return $raw ? json_decode($raw, true) : [];
}

switch ($method) {

    case 'GET':
        $sql = "
            SELECT
                ID_ACTIVIDAD,
                NOMBRE_ACTIVIDAD,
                ID_TIP_ACTIVIDAD,
                TO_CHAR(FECHA_ACTIVIDAD, 'YYYY-MM-DD') AS FEC_ACTIVIDAD,
                LUGAR_ACTIVIDAD,
                TO_CHAR(HORA_ACTIVIDAD, 'HH24:MI')      AS HORA_ACTIVIDAD,
                ID_TIP_PAGO,
                DESCRIP_ACTIVIDAD,
                COSTO_ACTIVIDAD,
                MONEDA_ACTIVIDAD,
                ID_CUENTA_BCO
            FROM ACTIVIDADES
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
        $data = getJsonBody();

        $sql = "
            INSERT INTO ACTIVIDADES
            (
                NOMBRE_ACTIVIDAD,
                ID_TIP_ACTIVIDAD,
                FECHA_ACTIVIDAD,
                LUGAR_ACTIVIDAD,
                HORA_ACTIVIDAD,
                ID_TIP_PAGO,
                DESCRIP_ACTIVIDAD,
                COSTO_ACTIVIDAD,
                MONEDA_ACTIVIDAD,
                ID_CUENTA_BCO
            )
            VALUES
            (
                :nombre,
                :id_tip_act,
                TO_DATE(:fecha, 'YYYY-MM-DD'),
                :lugar,
                TO_DATE(:fecha || ' ' || :hora, 'YYYY-MM-DD HH24:MI'),
                :id_tip_pago,
                :descrip,
                :costo,
                :moneda,
                :cuenta
            )
        ";

        $stmt = oci_parse($conn, $sql);

        $fecha = $data["fecha_actividad"] ?? null;
        $hora  = $data["hora_actividad"]   ?? null;

        oci_bind_by_name($stmt, ":nombre",     $data["nombre_actividad"]);
        oci_bind_by_name($stmt, ":id_tip_act", $data["id_tip_actividad"]);
        oci_bind_by_name($stmt, ":fecha",      $fecha);
        oci_bind_by_name($stmt, ":lugar",      $data["lugar_actividad"]);
        oci_bind_by_name($stmt, ":hora",       $hora);
        oci_bind_by_name($stmt, ":id_tip_pago",$data["id_tip_pago"]);
        oci_bind_by_name($stmt, ":descrip",    $data["descrip_actividad"]);
        oci_bind_by_name($stmt, ":costo",      $data["costo_actividad"]);
        oci_bind_by_name($stmt, ":moneda",     $data["moneda_actividad"]);
        oci_bind_by_name($stmt, ":cuenta",     $data["id_cuenta_bco"]);

        $ok = oci_execute($stmt, OCI_NO_AUTO_COMMIT);

        if ($ok) {
            oci_commit($conn);
            echo json_encode(["status" => "success", "mensaje" => "Actividad registrada correctamente"]);
        } else {
            oci_rollback($conn);
            echo json_encode(["status" => "error", "mensaje" => "Error al registrar actividad"]);
        }
        break;

    case 'PUT':
        $data = getJsonBody();

        if (empty($data["id_actividad"])) {
            echo json_encode(["status" => "error", "mensaje" => "id_actividad es requerido"]);
            break;
        }

        $sql = "
            UPDATE ACTIVIDADES SET
                NOMBRE_ACTIVIDAD  = :nombre,
                ID_TIP_ACTIVIDAD  = :id_tip_act,
                FECHA_ACTIVIDAD   = TO_DATE(:fecha, 'YYYY-MM-DD'),
                LUGAR_ACTIVIDAD   = :lugar,
                HORA_ACTIVIDAD    = TO_DATE(:fecha || ' ' || :hora, 'YYYY-MM-DD HH24:MI'),
                ID_TIP_PAGO       = :id_tip_pago,
                DESCRIP_ACTIVIDAD = :descrip,
                COSTO_ACTIVIDAD   = :costo,
                MONEDA_ACTIVIDAD  = :moneda,
                ID_CUENTA_BCO     = :cuenta
            WHERE ID_ACTIVIDAD   = :id
        ";

        $stmt  = oci_parse($conn, $sql);
        $fecha = $data["fecha_actividad"] ?? null;
        $hora  = $data["hora_actividad"]   ?? null;

        oci_bind_by_name($stmt, ":id",         $data["id_actividad"]);
        oci_bind_by_name($stmt, ":nombre",     $data["nombre_actividad"]);
        oci_bind_by_name($stmt, ":id_tip_act", $data["id_tip_actividad"]);
        oci_bind_by_name($stmt, ":fecha",      $fecha);
        oci_bind_by_name($stmt, ":lugar",      $data["lugar_actividad"]);
        oci_bind_by_name($stmt, ":hora",       $hora);
        oci_bind_by_name($stmt, ":id_tip_pago",$data["id_tip_pago"]);
        oci_bind_by_name($stmt, ":descrip",    $data["descrip_actividad"]);
        oci_bind_by_name($stmt, ":costo",      $data["costo_actividad"]);
        oci_bind_by_name($stmt, ":moneda",     $data["moneda_actividad"]);
        oci_bind_by_name($stmt, ":cuenta",     $data["id_cuenta_bco"]);

        $ok = oci_execute($stmt, OCI_NO_AUTO_COMMIT);

        if ($ok) {
            oci_commit($conn);
            echo json_encode(["status" => "success", "mensaje" => "Actividad actualizada correctamente"]);
        } else {
            oci_rollback($conn);
            echo json_encode(["status" => "error", "mensaje" => "Error al actualizar actividad"]);
        }
        break;

    case 'DELETE':
        $data = getJsonBody();

        if (empty($data["id_actividad"])) {
            echo json_encode(["status" => "error", "mensaje" => "id_actividad es requerido"]);
            break;
        }

        $sql = "DELETE FROM ACTIVIDADES WHERE ID_ACTIVIDAD = :id";
        $stmt = oci_parse($conn, $sql);
        oci_bind_by_name($stmt, ":id", $data["id_actividad"]);

        $ok = oci_execute($stmt, OCI_NO_AUTO_COMMIT);

        if ($ok) {
            oci_commit($conn);
            echo json_encode(["status" => "success", "mensaje" => "Actividad eliminada correctamente"]);
        } else {
            oci_rollback($conn);
            echo json_encode(["status" => "error", "mensaje" => "Error al eliminar actividad"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}

oci_close($conn);