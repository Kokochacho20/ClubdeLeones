<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $codProvincia = isset($_GET['cod_provincia']) ? trim($_GET['cod_provincia']) : null;

    if ($codProvincia !== null && $codProvincia !== '') {
        $sql = "SELECT c.cod_canton,
                       c.cod_provincia,
                       c.nombre_canton
                  FROM cantones c
                 WHERE c.cod_provincia = :cod_provincia
              ORDER BY c.nombre_canton";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ':cod_provincia', $codProvincia);
    } else {
        $sql = "SELECT c.cod_canton,
                       c.cod_provincia,
                       c.nombre_canton
                  FROM cantones c
              ORDER BY c.cod_provincia, c.nombre_canton";
        $stid = oci_parse($conn, $sql);
    }

    oci_execute($stid);
    $cantones = [];
    while ($row = oci_fetch_assoc($stid)) {
        $cantones[] = $row;
    }
    oci_free_statement($stid);

    echo json_encode($cantones);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['accion'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Acción no especificada']);
        exit;
    }

    $accion = $input['accion'];

    // Crear
    if ($accion === 'crear') {
        $codProvincia = $input['cod_provincia'] ?? null;
        $nombreCanton = $input['nombre_canton'] ?? null;

        if (!$codProvincia || !$nombreCanton) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'mensaje' => 'Faltan datos para crear el cantón']);
            exit;
        }

        $sql = "INSERT INTO cantones (cod_provincia, nombre_canton)
                VALUES (:cod_provincia, :nombre_canton)";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ':cod_provincia', $codProvincia);
        oci_bind_by_name($stid, ':nombre_canton', $nombreCanton);

        $ok = oci_execute($stid, OCI_NO_AUTO_COMMIT);
        if (!$ok) {
            $e = oci_error($stid);
            oci_rollback($conn);
            http_response_code(500);
            echo json_encode([
                'ok'      => false,
                'mensaje' => 'Error al crear el cantón',
                'error'   => $e['message']
            ]);
        } else {
            oci_commit($conn);
            echo json_encode(['ok' => true, 'mensaje' => 'Cantón creado correctamente']);
        }
        oci_free_statement($stid);
        exit;
    }

    // Eliminar
    if ($accion === 'eliminar') {
        $codCanton = $input['cod_canton'] ?? null;

        if (!$codCanton) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'mensaje' => 'Falta el identificador del cantón']);
            exit;
        }

        $sql = "DELETE FROM cantones WHERE cod_canton = :cod_canton";
        $stid = oci_parse($conn, $sql);
        oci_bind_by_name($stid, ':cod_canton', $codCanton);

        $ok = oci_execute($stid, OCI_NO_AUTO_COMMIT);
        if (!$ok) {
            $e = oci_error($stid);
            oci_rollback($conn);

            $mensaje = 'Error al eliminar el cantón';
            if (strpos($e['message'], 'ORA-02292') !== false) {
                $mensaje = 'No se puede eliminar el cantón porque tiene distritos asociados.';
            }

            http_response_code(500);
            echo json_encode([
                'ok'      => false,
                'mensaje' => $mensaje,
                'error'   => $e['message']
            ]);
        } else {
            oci_commit($conn);
            echo json_encode(['ok' => true, 'mensaje' => 'Cantón eliminado correctamente']);
        }
        oci_free_statement($stid);
        exit;
    }

    http_response_code(400);
    echo json_encode(['ok' => false, 'mensaje' => 'Acción no soportada']);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);