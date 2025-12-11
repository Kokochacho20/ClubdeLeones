<?php
header('Content-Type: application/json');
require_once 'db.php';

$method       = $_SERVER['REQUEST_METHOD'];
$id_actividad = isset($_GET['id']) ? $_GET['id'] : null;

try {
    $conn = getConnection();

    switch ($method) {

        case 'GET':
            if ($id_actividad) {
                $sql  = "SELECT *
                         FROM ACTIVIDADES
                         WHERE ID_ACTIVIDAD = :id_actividad";
                $stmt = oci_parse($conn, $sql);
                oci_bind_by_name($stmt, ':id_actividad', $id_actividad);
            } else {
                $sql  = "SELECT *
                         FROM ACTIVIDADES
                         ORDER BY FECHA_ACTIVIDAD DESC";
                $stmt = oci_parse($conn, $sql);
            }

            oci_execute($stmt);

            $actividades = [];
            while ($row = oci_fetch_assoc($stmt)) {
                $actividades[] = $row;
            }

            oci_free_statement($stmt);

            if ($id_actividad && count($actividades) === 1) {
                echo json_encode($actividades[0]);
            } else {
                echo json_encode($actividades);
            }
            break;


        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);


            $stmt = oci_parse($conn, '
                BEGIN
                    insertar_actividad(
                        :p_nombre_actividad,
                        :p_id_tip_actividad,
                        :p_fecha_actividad,
                        :p_lugar_actividad,
                        :p_hora_actividad,
                        :p_id_tip_pago,
                        :p_descrip_actividad,
                        :p_costo_actividad,
                        :p_moneda_actividad,
                        :p_id_cuenta_bco
                    );
                END;
            ');

            oci_bind_by_name($stmt, ':p_nombre_actividad', $data['nombre_actividad']);
            oci_bind_by_name($stmt, ':p_id_tip_actividad', $data['id_tip_actividad']);
            oci_bind_by_name($stmt, ':p_fecha_actividad',  $data['fecha_actividad']);
            oci_bind_by_name($stmt, ':p_lugar_actividad',  $data['lugar_actividad']);
            oci_bind_by_name($stmt, ':p_hora_actividad',   $data['hora_actividad']);
            oci_bind_by_name($stmt, ':p_id_tip_pago',      $data['id_tip_pago']);
            // puede venir o no en el JSON
            $descrip = isset($data['descrip_actividad']) ? $data['descrip_actividad'] : null;
            oci_bind_by_name($stmt, ':p_descrip_actividad', $descrip);
            oci_bind_by_name($stmt, ':p_costo_actividad',   $data['costo_actividad']);
            $moneda = isset($data['moneda_actividad']) ? $data['moneda_actividad'] : 'C';
            oci_bind_by_name($stmt, ':p_moneda_actividad',  $moneda);
            oci_bind_by_name($stmt, ':p_id_cuenta_bco',     $data['id_cuenta_bco']);

            $result = oci_execute($stmt);

            if ($result) {

                oci_commit($conn);
                echo json_encode([
                    'success' => true,
                    'message' => 'Actividad creada exitosamente (insertar_actividad).'
                ]);
            } else {
                $e = oci_error($stmt);
                throw new Exception($e['message']);
            }

            oci_free_statement($stmt);
            break;


        case 'PUT':
            if (!$id_actividad) {
                http_response_code(400);
                echo json_encode(['error' => 'ID de actividad no proporcionado']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = oci_parse($conn, '
                BEGIN
                    actualizar_actividad(
                        :p_id_actividad,
                        :p_nombre_actividad,
                        :p_id_tip_actividad,
                        :p_fecha_actividad,
                        :p_lugar_actividad,
                        :p_hora_actividad,
                        :p_id_tip_pago,
                        :p_descrip_actividad,
                        :p_costo_actividad,
                        :p_moneda_actividad,
                        :p_id_cuenta_bco
                    );
                END;
            ');

            oci_bind_by_name($stmt, ':p_id_actividad',      $id_actividad);
            oci_bind_by_name($stmt, ':p_nombre_actividad',  $data['nombre_actividad']);
            oci_bind_by_name($stmt, ':p_id_tip_actividad',  $data['id_tip_actividad']);
            oci_bind_by_name($stmt, ':p_fecha_actividad',   $data['fecha_actividad']);
            oci_bind_by_name($stmt, ':p_lugar_actividad',   $data['lugar_actividad']);
            oci_bind_by_name($stmt, ':p_hora_actividad',    $data['hora_actividad']);
            oci_bind_by_name($stmt, ':p_id_tip_pago',       $data['id_tip_pago']);
            $descrip = isset($data['descrip_actividad']) ? $data['descrip_actividad'] : null;
            oci_bind_by_name($stmt, ':p_descrip_actividad', $descrip);
            oci_bind_by_name($stmt, ':p_costo_actividad',   $data['costo_actividad']);
            $moneda = isset($data['moneda_actividad']) ? $data['moneda_actividad'] : 'C';
            oci_bind_by_name($stmt, ':p_moneda_actividad',  $moneda);
            oci_bind_by_name($stmt, ':p_id_cuenta_bco',     $data['id_cuenta_bco']);

            $result = oci_execute($stmt);

            if ($result) {
                oci_commit($conn);
                echo json_encode([
                    'success' => true,
                    'message' => 'Actividad actualizada exitosamente (actualizar_actividad).'
                ]);
            } else {
                $e = oci_error($stmt);
                throw new Exception($e['message']);
            }

            oci_free_statement($stmt);
            break;


        case 'DELETE':
            if (!$id_actividad) {
                http_response_code(400);
                echo json_encode(['error' => 'ID de actividad no proporcionado']);
                exit;
            }


            $stmt = oci_parse($conn, '
                BEGIN
                    eliminar_actividad(:p_id_actividad);
                END;
            ');

            oci_bind_by_name($stmt, ':p_id_actividad', $id_actividad);

            $result = oci_execute($stmt);

            if ($result) {
                oci_commit($conn);
                echo json_encode([
                    'success' => true,
                    'message' => 'Actividad eliminada exitosamente (eliminar_actividad).'
                ]);
            } else {
                $e = oci_error($stmt);
                throw new Exception($e['message']);
            }

            oci_free_statement($stmt);
            break;


        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error'   => true,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        oci_close($conn);
    }
}
