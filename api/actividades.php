<?php
header('Content-Type: application/json');
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

$id_actividad = isset($_GET['id']) ? $_GET['id'] : null;

try {
    $conn =  getConnection();
    
    switch ($method) {
        case 'GET':
            if ($id_actividad) {
           
                $sql = "SELECT a.*, CONCAT(s.NOMBRE, ' ', s.APELLIDO1, ' ', COALESCE(s.APELLIDO2, '')) AS NOMBRE_RESPONSABLE 
                        FROM ACTIVIDADES a 
                        LEFT JOIN SOCIOS s ON a.ID_SOCIO_RESPONSABLE = s.ID_SOCIO 
                        WHERE a.ID_ACTIVIDAD = :id_actividad";
                $stmt = oci_parse($conn, $sql);
                oci_bind_by_name($stmt, ':id_actividad', $id_actividad);
            } else {
                $sql = "SELECT a.*, CONCAT(s.NOMBRE, ' ', s.APELLIDO1, ' ', COALESCE(s.APELLIDO2, '')) AS NOMBRE_RESPONSABLE, 
                               t.NOMBRE AS TIPO_ACTIVIDAD
                        FROM ACTIVIDADES a 
                        LEFT JOIN SOCIOS s ON a.ID_SOCIO_RESPONSABLE = s.ID_SOCIO 
                        LEFT JOIN TIPOS_ACTIVIDAD t ON a.ID_TIPO_ACTIVIDAD = t.ID_TIPO_ACTIVIDAD
                        ORDER BY a.FEC_ACTIVIDAD DESC";
                $stmt = oci_parse($conn, $sql);
            }
            
            oci_execute($stmt);
            $actividades = [];
            while ($row = oci_fetch_assoc($stmt)) {
                $actividades[] = $row;
            }
            
            if ($id_actividad && count($actividades) === 1) {
                echo json_encode($actividades[0]);
            } else {
                echo json_encode($actividades);
            }
            break;

        case 'POST':
            // Crear actividad
            $data = json_decode(file_get_contents('php://input'), true);
            
            $sql = "INSERT INTO ACTIVIDADES (
                        NOMBRE, ID_TIPO_ACTIVIDAD, FEC_ACTIVIDAD, 
                        ID_SOCIO_RESPONSABLE, OBJETIVO, FEC_CREACION
                    ) VALUES (
                        :nombre, :id_tipo_actividad, TO_DATE(:fec_actividad, 'YYYY-MM-DD'),
                        :id_socio_responsable, :objetivo, SYSDATE
                    ) RETURNING ID_ACTIVIDAD INTO :id_actividad";
            
            $stmt = oci_parse($conn, $sql);
            
            oci_bind_by_name($stmt, ':nombre', $data['nombre']);
            oci_bind_by_name($stmt, ':id_tipo_actividad', $data['id_tipo_actividad']);
            oci_bind_by_name($stmt, ':fec_actividad', $data['fec_actividad']);
            oci_bind_by_name($stmt, ':id_socio_responsable', $data['id_socio_responsable']);
            oci_bind_by_name($stmt, ':objetivo', $data['objetivo']);
            oci_bind_by_name($stmt, ':id_actividad', $id_actividad, 32);
            
            $result = oci_execute($stmt);
            
            if ($result) {
                oci_commit($conn);
                echo json_encode([
                    'success' => true,
                    'id_actividad' => $id_actividad,
                    'message' => 'Actividad creada exitosamente.'
                ]);
            } else {
                $e = oci_error($stmt);
                throw new Exception($e['message']);
            }
            break;

        case 'PUT':
            // Actualizar actividad 
            if (!$id_actividad) {
                http_response_code(400);
                echo json_encode(['error' => 'ID de actividad no proporcionado']);
                exit;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $sql = "UPDATE ACTIVIDADES SET 
                        NOMBRE = :nombre,
                        ID_TIPO_ACTIVIDAD = :id_tipo_actividad,
                        FEC_ACTIVIDAD = TO_DATE(:fec_actividad, 'YYYY-MM-DD'),
                        ID_SOCIO_RESPONSABLE = :id_socio_responsable,
                        OBJETIVO = :objetivo
                    WHERE ID_ACTIVIDAD = :id_actividad";
            
            $stmt = oci_parse($conn, $sql);
            
            oci_bind_by_name($stmt, ':id_actividad', $id_actividad);
            oci_bind_by_name($stmt, ':nombre', $data['nombre']);
            oci_bind_by_name($stmt, ':id_tipo_actividad', $data['id_tipo_actividad']);
            oci_bind_by_name($stmt, ':fec_actividad', $data['fec_actividad']);
            oci_bind_by_name($stmt, ':id_socio_responsable', $data['id_socio_responsable']);
            oci_bind_by_name($stmt, ':objetivo', $data['objetivo']);
            
            $result = oci_execute($stmt);
            
            if ($result) {
                oci_commit($conn);
                echo json_encode([
                    'success' => true,
                    'message' => 'Actividad actualizada exitosamente.'
                ]);
            } else {
                $e = oci_error($stmt);
                throw new Exception($e['message']);
            }
            break;

        case 'DELETE':
            // Eliminar actividad
            if (!$id_actividad) {
                http_response_code(400);
                echo json_encode(['error' => 'ID de actividad no proporcionado']);
                exit;
            }
            
            $sql_check = "SELECT COUNT(*) AS total FROM DETALLE_ACTIVIDADES WHERE ID_ACTIVIDAD = :id_actividad";
            $stmt_check = oci_parse($conn, $sql_check);
            oci_bind_by_name($stmt_check, ':id_actividad', $id_actividad);
            oci_execute($stmt_check);
            $row = oci_fetch_assoc($stmt_check);
            
            if ($row['TOTAL'] > 0) {
                http_response_code(400);
                echo json_encode([
                    'error' => true,
                    'message' => 'No se puede eliminar la actividad porque tiene registros relacionados en el detalle de actividades.'
                ]);
                exit;
            }
            
            $sql = "DELETE FROM ACTIVIDADES WHERE ID_ACTIVIDAD = :id_actividad";
            $stmt = oci_parse($conn, $sql);
            oci_bind_by_name($stmt, ':id_actividad', $id_actividad);
            
            $result = oci_execute($stmt);
            
            if ($result) {
                oci_commit($conn);
                echo json_encode([
                    'success' => true,
                    'message' => 'Actividad eliminada exitosamente.'
                ]);
            } else {
                $e = oci_error($stmt);
                throw new Exception($e['message']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        oci_close($conn);
    }
}
?>
