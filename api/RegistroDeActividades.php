<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php'; // AJUSTA el nombre/ubicación si tu archivo se llama distinto

$conn = getConnection(); // AJUSTA al nombre de tu función de conexión

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getActividades($conn);
        break;

    case 'POST':
        crearActividad($conn);
        break;

    case 'PUT':
        actualizarActividad($conn);
        break;

    case 'DELETE':
        eliminarActividad($conn);
        break;

    default:
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        break;
}

function getActividades($conn)
{
    $sql = "
        SELECT
            id_actividad,
            nombre_actividad,
            id_tipo_actividad,
            TO_CHAR(fec_actividad, 'YYYY-MM-DD') AS fec_actividad,
            id_socio_resp,
            objetivo_actividad
        FROM actividades
        ORDER BY id_actividad
    ";

    $stmt = oci_parse($conn, $sql);
    oci_execute($stmt);

    $resultado = [];
    while ($fila = oci_fetch_assoc($stmt)) {
        $resultado[] = $fila; // claves en MAYÚSCULA
    }

    echo json_encode($resultado);
}

function crearActividad($conn)
{
    $input = json_decode(file_get_contents('php://input'), true);

    $nombre   = trim($input['nombre_actividad'] ?? '');
    $tipo     = $input['id_tipo_actividad'] ?? null;
    $fecha    = $input['fec_actividad'] ?? '';
    $socio    = $input['id_socio_resp'] ?? null;
    $objetivo = trim($input['objetivo_actividad'] ?? '');

    if ($nombre === '' || $tipo === null || $fecha === '') {
        echo json_encode(['ok' => false, 'mensaje' => 'Nombre, tipo y fecha son obligatorios']);
        return;
    }

    $sql = "
        INSERT INTO actividades (
            nombre_actividad,
            id_tipo_actividad,
            fec_actividad,
            id_socio_resp,
            objetivo_actividad
        ) VALUES (
            :nombre,
            :tipo,
            TO_DATE(:fecha, 'YYYY-MM-DD'),
            :socio,
            :objetivo
        )
        RETURNING id_actividad INTO :id_generado
    ";

    $stmt = oci_parse($conn, $sql);

    oci_bind_by_name($stmt, ':nombre',   $nombre);
    oci_bind_by_name($stmt, ':tipo',     $tipo);
    oci_bind_by_name($stmt, ':fecha',    $fecha);
    oci_bind_by_name($stmt, ':socio',    $socio);
    oci_bind_by_name($stmt, ':objetivo', $objetivo);

    $idGenerado = 0;
    oci_bind_by_name($stmt, ':id_generado', $idGenerado, 32);

    $ok = oci_execute($stmt, OCI_NO_AUTO_COMMIT);

    if ($ok) {
        oci_commit($conn);
        echo json_encode([
            'ok'       => true,
            'mensaje'  => 'Actividad registrada correctamente',
            'id'       => $idGenerado
        ]);
    } else {
        oci_rollback($conn);
        $e = oci_error($stmt);
        echo json_encode([
            'ok'      => false,
            'mensaje' => 'Error al registrar la actividad',
            'error'   => $e['message'] ?? ''
        ]);
    }
}

function actualizarActividad($conn)
{
    $input = json_decode(file_get_contents('php://input'), true);

    $id       = $input['id_actividad'] ?? null;
    $nombre   = trim($input['nombre_actividad'] ?? '');
    $tipo     = $input['id_tipo_actividad'] ?? null;
    $fecha    = $input['fec_actividad'] ?? '';
    $socio    = $input['id_socio_resp'] ?? null;
    $objetivo = trim($input['objetivo_actividad'] ?? '');

    if (!$id) {
        echo json_encode(['ok' => false, 'mensaje' => 'ID de actividad requerido']);
        return;
    }

    if ($nombre === '' || $tipo === null || $fecha === '') {
        echo json_encode(['ok' => false, 'mensaje' => 'Nombre, tipo y fecha son obligatorios']);
        return;
    }

    $sql = "
        UPDATE actividades
        SET
            nombre_actividad  = :nombre,
            id_tipo_actividad = :tipo,
            fec_actividad     = TO_DATE(:fecha, 'YYYY-MM-DD'),
            id_socio_resp     = :socio,
            objetivo_actividad = :objetivo
        WHERE id_actividad = :id
    ";

    $stmt = oci_parse($conn, $sql);

    oci_bind_by_name($stmt, ':nombre',   $nombre);
    oci_bind_by_name($stmt, ':tipo',     $tipo);
    oci_bind_by_name($stmt, ':fecha',    $fecha);
    oci_bind_by_name($stmt, ':socio',    $socio);
    oci_bind_by_name($stmt, ':objetivo', $objetivo);
    oci_bind_by_name($stmt, ':id',       $id);

    $ok = oci_execute($stmt, OCI_NO_AUTO_COMMIT);

    if ($ok) {
        oci_commit($conn);
        echo json_encode(['ok' => true, 'mensaje' => 'Actividad actualizada correctamente']);
    } else {
        oci_rollback($conn);
        $e = oci_error($stmt);
        echo json_encode([
            'ok'      => false,
            'mensaje' => 'Error al actualizar la actividad',
            'error'   => $e['message'] ?? ''
        ]);
    }
}

function eliminarActividad($conn)
{
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id_actividad'] ?? null;

    if (!$id) {
        echo json_encode(['ok' => false, 'mensaje' => 'ID de actividad requerido']);
        return;
    }

    $sql = "DELETE FROM actividades WHERE id_actividad = :id";
    $stmt = oci_parse($conn, $sql);
    oci_bind_by_name($stmt, ':id', $id);

    $ok = oci_execute($stmt, OCI_NO_AUTO_COMMIT);

    if ($ok) {
        oci_commit($conn);
        echo json_encode(['ok' => true, 'mensaje' => 'Actividad eliminada correctamente']);
    } else {
        oci_rollback($conn);
        $e = oci_error($stmt);
        echo json_encode([
            'ok'      => false,
            'mensaje' => 'Error al eliminar la actividad',
            'error'   => $e['message'] ?? ''
        ]);
    }
}