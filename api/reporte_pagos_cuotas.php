<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

try {
    $idSocio = isset($_GET['id_socio']) ? (int)$_GET['id_socio'] : 0;
    $fechaDesde = $_GET['fecha_desde'] ?? null;
    $fechaHasta = $_GET['fecha_hasta'] ?? null;

    if (!$idSocio || !$fechaDesde || !$fechaHasta) {
        echo json_encode([
            'ok' => false,
            'mensaje' => 'Parámetros incompletos para el reporte de cuotas'
        ]);
        exit;
    }

    $conn = getConnection();

    $sql = "
        BEGIN
            reporte_pagos_cuotas_socio(
                :p_id_socio,
                TO_DATE(:p_fecha_desde, 'YYYY-MM-DD'),
                TO_DATE(:p_fecha_hasta, 'YYYY-MM-DD'),
                :p_cursor,
                :p_total_periodo
            );
        END;";

    $stmt = oci_parse($conn, $sql);

    $cursor = oci_new_cursor($conn);
    $totalPeriodo = 0;

    oci_bind_by_name($stmt, ':p_id_socio', $idSocio, -1, SQLT_INT);
    oci_bind_by_name($stmt, ':p_fecha_desde', $fechaDesde);
    oci_bind_by_name($stmt, ':p_fecha_hasta', $fechaHasta);
    oci_bind_by_name($stmt, ':p_cursor', $cursor, -1, OCI_B_CURSOR);
    oci_bind_by_name($stmt, ':p_total_periodo', $totalPeriodo, 40);

    if (!oci_execute($stmt)) {
        $e = oci_error($stmt);
        throw new Exception($e['message']);
    }

    if (!oci_execute($cursor)) {
        $e = oci_error($cursor);
        throw new Exception($e['message']);
    }

    $datos = [];
    while (($row = oci_fetch_assoc($cursor)) != false) {
        $datos[] = array_change_key_case($row, CASE_LOWER);
    }

    oci_free_statement($cursor);
    oci_free_statement($stmt);
    oci_close($conn);

    echo json_encode([
        'ok' => true,
        'datos' => $datos,
        'total_periodo' => (float)$totalPeriodo
    ]);
} catch (Exception $ex) {
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Error al generar reporte de cuotas: ' . $ex->getMessage()
    ]);
}
