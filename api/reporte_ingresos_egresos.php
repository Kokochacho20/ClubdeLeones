<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Método no permitido, use GET'
    ]);
    exit;
}

// Parametros
$idActividad = isset($_GET['id_actividad']) ? (int)$_GET['id_actividad'] : 0;
$fechaDesde  = $_GET['fecha_desde'] ?? null;
$fechaHasta  = $_GET['fecha_hasta'] ?? null;
$tipo        = $_GET['tipo'] ?? null;

if ($tipo === '') {
    $tipo = null;
}

// Validacion
if (!$idActividad || !$fechaDesde || !$fechaHasta) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Parámetros incompletos: id_actividad, fecha_desde y fecha_hasta son obligatorios'
    ]);
    exit;
}

try {
    $conn = getConnection();
    if (!$conn) {
        throw new Exception('No se pudo obtener la conexión a la BD');
    }

    $sql = "
        BEGIN
            reporte_ingresos_egresos_actividad(
                :p_id_actividad,
                TO_DATE(:p_fecha_desde, 'YYYY-MM-DD'),
                TO_DATE(:p_fecha_hasta, 'YYYY-MM-DD'),
                :p_tipo_filtro,
                :p_cursor,
                :p_total_ingresos,
                :p_total_egresos,
                :p_balance_final
            );
        END;
    ";

    $stmt = oci_parse($conn, $sql);
    if (!$stmt) {
        $e = oci_error($conn);
        throw new Exception('Error al preparar sentencia: ' . $e['message']);
    }

    $cursor = oci_new_cursor($conn);

    // ENTRADA
    oci_bind_by_name($stmt, ':p_id_actividad', $idActividad);
    oci_bind_by_name($stmt, ':p_fecha_desde', $fechaDesde);
    oci_bind_by_name($stmt, ':p_fecha_hasta', $fechaHasta);
    oci_bind_by_name($stmt, ':p_tipo_filtro', $tipo, 1);

    // SALIDA
    oci_bind_by_name($stmt, ':p_cursor', $cursor, -1, OCI_B_CURSOR);
    oci_bind_by_name($stmt, ':p_total_ingresos', $totalIngresos, 40);
    oci_bind_by_name($stmt, ':p_total_egresos', $totalEgresos, 40);
    oci_bind_by_name($stmt, ':p_balance_final', $balanceFinal, 40);

    // Ejecutar procedimiento
    if (!oci_execute($stmt)) {
        $e = oci_error($stmt);
        throw new Exception('Error al ejecutar procedimiento: ' . $e['message']);
    }

    // Ejecutar cursor
    if (!oci_execute($cursor)) {
        $e = oci_error($cursor);
        throw new Exception('Error al ejecutar cursor: ' . $e['message']);
    }

    // Leer filas
    $datos = [];
    while (($row = oci_fetch_assoc($cursor)) !== false) {
        $row = array_change_key_case($row, CASE_LOWER);
        if (isset($row['monto'])) {
            $row['monto'] = (float)$row['monto'];
        }
        $datos[] = $row;
    }

    oci_free_statement($cursor);
    oci_free_statement($stmt);
    oci_close($conn);

    $totalIngresos = (float)$totalIngresos;
    $totalEgresos = (float)$totalEgresos;
    $balanceFinal = (float)$balanceFinal;

    echo json_encode([
        'ok'     => true,
        'datos'  => $datos,
        'totales' => [
            'total_ingresos' => $totalIngresos,
            'total_egresos' => $totalEgresos,
            'balance_final' => $balanceFinal
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok'      => false,
        'mensaje' => 'Error en el servidor: ' . $e->getMessage()
    ]);
}
