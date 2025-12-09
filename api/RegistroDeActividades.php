<?php
require_once 'db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    $conn = getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error de conexión a la base de datos']);
    exit;
}

if ($method === 'GET') {
    $sql = "SELECT 
                ID_ACTIVIDAD,
                NOMBRE_ACTIVIDAD,
                ID_TIPO_ACTIVIDAD,
                FEC_ACTIVIDAD,
                ID_SOCIO_RESP,
                OBJETIVO
            FROM ACTIVIDADES
            ORDER BY FEC_ACTIVIDAD DESC, ID_ACTIVIDAD DESC";

    $stmt = oci_parse($conn, $sql);
    oci_execute($stmt);

    $result = [];
    while ($row = oci_fetch_assoc($stmt)) {
        $result[] = $row;
    }

    echo json_encode($result);
    oci_free_statement($stmt);
    oci_close($conn);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $nombre = isset($input['nombre_actividad']) ? trim($input['nombre_actividad']) : '';
    $idTipo = isset($input['id_tipo_actividad']) ? $input['id_tipo_actividad'] : null;
    $fecha = isset($input['fec_actividad']) ? $input['fec_actividad'] : null;
    $idSocio = isset($input['id_socio_resp']) ? $input['id_socio_resp'] : null;
    $objetivo = isset($input['objetivo_actividad']) ? trim($input['objetivo_actividad']) : '';

    if ($nombre === '' || !$idTipo || !$fecha) {
        echo json_encode(['ok' => false, 'mensaje' => 'Nombre, tipo y fecha son obligatorios']);
        exit;
    }

    $sql = "INSERT INTO ACTIVIDADES (
                ID_ACTIVIDAD,
                NOMBRE_ACTIVIDAD,
                ID_TIPO_ACTIVIDAD,
                FEC_ACTIVIDAD,
                ID_SOCIO_RESP,
                OBJETIVO
            ) VALUES (
                SEQ_ACTIVIDADES.NEXTVAL,
                :p_nombre,
                :p_id_tipo,
                TO_DATE(:p_fecha, 'YYYY-MM-DD'),
                :p_id_socio,
                :p_objetivo
            ) RETURNING ID_ACTIVIDAD INTO :p_id_out";

    $stmt = oci_parse($conn, $sql);

    oci_bind_by_name($stmt, ':p_nombre', $nombre);
    oci_bind_by_name($stmt, ':p_id_tipo', $idTipo);
    oci_bind_by_name($stmt, ':p_fecha', $fecha);
    oci_bind_by_name($stmt, ':p_id_socio', $idSocio);
    oci_bind_by_name($stmt, ':p_objetivo', $objetivo);
    oci_bind_by_name($stmt, ':p_id_out', $idOut, 32);

    $ok = oci_execute($stmt, OCI_COMMIT_ON_SUCCESS);

    if ($ok) {
        echo json_encode(['ok' => true, 'mensaje' => 'Actividad registrada correctamente', 'id_actividad' => $idOut]);
    } else {
        $e = oci_error($stmt);
        echo json_encode(['ok' => false, 'mensaje' => 'Error al registrar la actividad']);
    }

    oci_free_statement($stmt);
    oci_close($conn);
    exit;
}

if ($method === 'PUT') {
    $id = isset($input['id_actividad']) ? $input['id_actividad'] : null;
    $nombre = isset($input['nombre_actividad']) ? trim($input['nombre_actividad']) : '';
    $idTipo = isset($input['id_tipo_actividad']) ? $input['id_tipo_actividad'] : null;
    $fecha = isset($input['fec_actividad']) ? $input['fec_actividad'] : null;
    $idSocio = isset($input['id_socio_resp']) ? $input['id_socio_resp'] : null;
    $objetivo = isset($input['objetivo_actividad']) ? trim($input['objetivo_actividad']) : '';

    if (!$id) {
        echo json_encode(['ok' => false, 'mensaje' => 'Falta el ID de la actividad']);
        exit;
    }

    $sql = "UPDATE ACTIVIDADES
            SET NOMBRE_ACTIVIDAD = :p_nombre,
                ID_TIPO_ACTIVIDAD = :p_id_tipo,
                FEC_ACTIVIDAD = TO_DATE(:p_fecha, 'YYYY-MM-DD'),
                ID_SOCIO_RESP = :p_id_socio,
                OBJETIVO = :p_objetivo
            WHERE ID_ACTIVIDAD = :p_id";

    $stmt = oci_parse($conn, $sql);

    oci_bind_by_name($stmt, ':p_nombre', $nombre);
    oci_bind_by_name($stmt, ':p_id_tipo', $idTipo);
    oci_bind_by_name($stmt, ':p_fecha', $fecha);
    oci_bind_by_name($stmt, ':p_id_socio', $idSocio);
    oci_bind_by_name($stmt, ':p_objetivo', $objetivo);
    oci_bind_by_name($stmt, ':p_id', $id);

    $ok = oci_execute($stmt, OCI_COMMIT_ON_SUCCESS);

    if ($ok) {
        echo json_encode(['ok' => true, 'mensaje' => 'Actividad actualizada correctamente']);
    } else {
        $e = oci_error($stmt);
        echo json_encode(['ok' => false, 'mensaje' => 'Error al actualizar la actividad']);
    }

    oci_free_statement($stmt);
    oci_close($conn);
    exit;
}

if ($method === 'DELETE') {
    $id = isset($input['id_actividad']) ? $input['id_actividad'] : null;

    if (!$id) {
        echo json_encode(['ok' => false, 'mensaje' => 'Falta el ID de la actividad']);
        exit;
    }

    $sql = "DELETE FROM ACTIVIDADES WHERE ID_ACTIVIDAD = :p_id";
    $stmt = oci_parse($conn, $sql);
    oci_bind_by_name($stmt, ':p_id', $id);

    $ok = oci_execute($stmt, OCI_COMMIT_ON_SUCCESS);

    if ($ok) {
        echo json_encode(['ok' => true, 'mensaje' => 'Actividad eliminada correctamente']);
    } else {
        $e = oci_error($stmt);
        echo json_encode(['ok' => false, 'mensaje' => 'Error al eliminar la actividad']);
    }

    oci_free_statement($stmt);
    oci_close($conn);
    exit;
}

echo json_encode(['ok' => false, 'mensaje' => 'Método no soportado']);
