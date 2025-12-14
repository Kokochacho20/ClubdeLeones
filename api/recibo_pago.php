<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

try {
    $idTransac = isset($_GET['id_transaccion']) ? (int)$_GET['id_transaccion'] : 0;

    if (!$idTransac) {
        echo json_encode([
            'ok' => false,
            'mensaje' => 'Debe indicar un ID de transacción'
        ]);
        exit;
    }

    $conn = getConnection();

    $sql = "
        BEGIN
            obtener_recibo_pago(
                :p_id_transaccion,
                :p_cursor
            );
        END;";

    $stmt = oci_parse($conn, $sql);
    $cursor = oci_new_cursor($conn);

    oci_bind_by_name($stmt, ':p_id_transaccion', $idTransac, -1, SQLT_INT);
    oci_bind_by_name($stmt, ':p_cursor', $cursor, -1, OCI_B_CURSOR);

    if (!oci_execute($stmt)) {
        $e = oci_error($stmt);
        throw new Exception($e['message']);
    }

    if (!oci_execute($cursor)) {
        $e = oci_error($cursor);
        throw new Exception($e['message']);
    }

    $row = oci_fetch_assoc($cursor);

    oci_free_statement($cursor);
    oci_free_statement($stmt);
    oci_close($conn);

    if (!$row) {
        echo json_encode([
            'ok' => false,
            'mensaje' => 'No se encontró la transacción indicada'
        ]);
        exit;
    }

    echo json_encode([
        'ok' => true,
        'recibo' => $row
    ]);
} catch (Exception $ex) {
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Error al obtener datos del recibo: ' . $ex->getMessage()
    ]);
}
