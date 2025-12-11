<?php
require_once 'db.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$conn = getConnection();


if ($method === 'GET') {

    
    if (isset($_GET['combo'])) {
        $sql = "BEGIN listar_actividades_socios(:p_cursor); END;";
        $stid = oci_parse($conn, $sql);

        $cursor = oci_new_cursor($conn);
        oci_bind_by_name($stid, ":p_cursor", $cursor, -1, OCI_B_CURSOR);

        if (!oci_execute($stid) || !oci_execute($cursor)) {
            $e = oci_error($stid);
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e['message']]);
            exit;
        }

        $resultado = [];
        while ($row = oci_fetch_assoc($cursor)) {
            $resultado[] = [
                "ID_ACTIV_SOC" => $row["ID_ACTIV_SOC"],
                "NOMBRE_ACTIVIDAD" => $row["NOMBRE_ACTIVIDAD"],
                "NOMBRE_SOCIO" => $row["NOMBRE_SOCIO"]
            ];
        }

        echo json_encode($resultado);
        exit;
    }

    if (isset($_GET['socios'])) {
        $sql = "SELECT id_socio, nombre_socio
                FROM socios
                ORDER BY nombre_socio";
        $stid = oci_parse($conn, $sql);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e['message']]);
            exit;
        }

        $socios = [];
        while ($row = oci_fetch_assoc($stid)) {
            $socios[] = $row;
        }

        echo json_encode($socios);
        exit;
    }

    if (isset($_GET['actividades'])) {
        $sql = "SELECT id_actividad, nombre_actividad
                FROM actividades
                ORDER BY nombre_actividad";
        $stid = oci_parse($conn, $sql);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e['message']]);
            exit;
        }

        $activs = [];
        while ($row = oci_fetch_assoc($stid)) {
            $activs[] = $row;
        }

        echo json_encode($activs);
        exit;
    }

    $sql = "SELECT 
                a.id_activ_soc,
                a.id_socio,
                s.nombre_socio,
                a.id_actividad,
                act.nombre_actividad,
                TO_CHAR(a.fec_comprom, 'YYYY-MM-DD') AS fec_comprom,
                a.estado,
                a.monto_comprom,
                a.saldo_comprom
            FROM activ_socio a
            JOIN socios s        ON a.id_socio     = s.id_socio
            JOIN actividades act ON a.id_actividad = act.id_actividad
            ORDER BY a.id_activ_soc";

    $stid = oci_parse($conn, $sql);

    if (!oci_execute($stid)) {
        $e = oci_error($stid);
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => $e['message']]);
        exit;
    }

    $lista = [];
    while ($row = oci_fetch_assoc($stid)) {
        $lista[] = $row;
    }

    echo json_encode($lista);
    exit;
}


if ($method === 'POST') {

    $accion = $_POST['accion'] ?? '';
    $id_activ_soc = $_POST['id_activ_soc'] ?? null;
    $id_socio = $_POST['id_socio'] ?? null;
    $id_actividad = $_POST['id_actividad'] ?? null;
    $fec_comprom = $_POST['fec_comprom'] ?? null;
    $estado = $_POST['estado'] ?? 'R';
    $monto_comprom  = $_POST['monto_comprom'] ?? null;
    $saldo_comprom  = $_POST['saldo_comprom'] ?? null;

    //CREAR
    if ($accion === 'crear') {

        if (!$id_socio || !$id_actividad || !$fec_comprom || $monto_comprom === null || $saldo_comprom === null) {
            echo json_encode(['ok' => false, 'mensaje' => 'Faltan datos obligatorios']);
            exit;
        }

        $sql = "BEGIN insertar_activ_socio(
                    :p_id_actividad,
                    :p_id_socio,
                    TO_DATE(:p_fec_comprom, 'YYYY-MM-DD'),
                    :p_estado,
                    :p_fec_cancela,
                    :p_monto_comprom,
                    :p_saldo_comprom
                ); END;";

        $stid = oci_parse($conn, $sql);

        $fec_cancela = null;

        oci_bind_by_name($stid, ":p_id_actividad", $id_actividad);
        oci_bind_by_name($stid, ":p_id_socio", $id_socio);
        oci_bind_by_name($stid, ":p_fec_comprom", $fec_comprom);
        oci_bind_by_name($stid, ":p_estado", $estado);
        oci_bind_by_name($stid, ":p_fec_cancela", $fec_cancela);
        oci_bind_by_name($stid, ":p_monto_comprom", $monto_comprom);
        oci_bind_by_name($stid, ":p_saldo_comprom", $saldo_comprom);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            echo json_encode(['ok' => false, 'mensaje' => $e['message']]);
            exit;
        }

        echo json_encode(['ok' => true, 'mensaje' => 'Actividad por socio registrada correctamente']);
        exit;
    }

    //ACTUALIZAR 
    if ($accion === 'actualizar') {

        if (!$id_activ_soc) {
            echo json_encode(['ok' => false, 'mensaje' => 'Falta el ID para actualizar']);
            exit;
        }

        $sql = "BEGIN actualizar_activ_socio(
                    :p_id_activ_soc,
                    :p_id_actividad,
                    :p_id_socio,
                    TO_DATE(:p_fec_comprom, 'YYYY-MM-DD'),
                    :p_estado,
                    :p_fec_cancela,
                    :p_monto_comprom,
                    :p_saldo_comprom
                ); END;";

        $stid = oci_parse($conn, $sql);

        $fec_cancela = null;

        oci_bind_by_name($stid, ":p_id_activ_soc", $id_activ_soc);
        oci_bind_by_name($stid, ":p_id_actividad", $id_actividad);
        oci_bind_by_name($stid, ":p_id_socio", $id_socio);
        oci_bind_by_name($stid, ":p_fec_comprom", $fec_comprom);
        oci_bind_by_name($stid, ":p_estado", $estado);
        oci_bind_by_name($stid, ":p_fec_cancela", $fec_cancela);
        oci_bind_by_name($stid, ":p_monto_comprom", $monto_comprom);
        oci_bind_by_name($stid, ":p_saldo_comprom", $saldo_comprom);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            echo json_encode(['ok' => false, 'mensaje' => $e['message']]);
            exit;
        }

        echo json_encode(['ok' => true, 'mensaje' => 'Actividad por socio actualizada correctamente']);
        exit;
    }

    //ELIMINAR
    if ($accion === 'eliminar') {

        if (!$id_activ_soc) {
            echo json_encode(['ok' => false, 'mensaje' => 'Falta el ID para eliminar']);
            exit;
        }

        $sql = "BEGIN eliminar_activ_socio(:p_id_activ_soc); END;";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ":p_id_activ_soc", $id_activ_soc);

        if (!oci_execute($stid)) {
            $e = oci_error($stid);
            echo json_encode(['ok' => false, 'mensaje' => $e['message']]);
            exit;
        }

        echo json_encode(['ok' => true, 'mensaje' => 'Actividad por socio eliminada correctamente']);
        exit;
    }

    echo json_encode(['ok' => false, 'mensaje' => 'Acción no reconocida']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
