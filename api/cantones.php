<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';
$conn = getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;
$cod_provincia = isset($_GET['provincia']) ? $_GET['provincia'] : null;

$data = json_decode(file_get_contents('php://input'), true);


switch ($method) {
    case 'GET':
        //listar cantones 
        if ($id) {
            $sql = "SELECT c.cod_canton, c.nombre_canton, c.cod_provincia, p.nombre_provincia 
                FROM CANTONES c
                JOIN PROVINCIAS p ON c.cod_provincia = p.cod_provincia
                WHERE c.cod_canton = :id";
            $stid = oci_parse($conn, $sql);
            oci_bind_by_name($stid, ':id', $id);
        } else if ($cod_provincia) {
            $sql = "SELECT c.cod_canton, c.nombre_canton, c.cod_provincia, p.nombre_provincia
                FROM CANTONES c
                JOIN PROVINCIAS p ON c.cod_provincia = p.cod_provincia
                WHERE c.cod_provincia = :cod_provincia
                ORDER BY c.nombre_canton";
            $stid = oci_parse($conn, $sql);
            oci_bind_by_name($stid, ':cod_provincia', $cod_provincia);
        } else {
            $sql = "SELECT c.cod_canton, c.nombre_canton, c.cod_provincia, p.nombre_provincia 
                FROM CANTONES c
                JOIN PROVINCIAS p ON c.cod_provincia = p.cod_provincia
                ORDER BY p.nombre_provincia, c.nombre_canton";
            $stid = oci_parse($conn, $sql);
        }

        oci_execute($stid);
        $cantones = [];

        while ($row = oci_fetch_assoc($stid)) {
            $cantones[] = [
                'cod_canton' => $row['COD_CANTON'],
                'nombre_canton' => $row['NOMBRE_CANTON'],
                'cod_provincia' => $row['COD_PROVINCIA'],
                'nombre_provincia' => $row['NOMBRE_PROVINCIA']
            ];
        }

        if ($id && empty($cantones)) {
            http_response_code(404);
            echo json_encode(['error' => 'Cantón no encontrado']);
        } else {
            echo json_encode($id ? $cantones[0] : $cantones);
        }
        break;

    case 'POST':
        //crar canton
        if (!empty($data['nombre_canton']) && !empty($data['cod_provincia'])) {

            $sql = "BEGIN insertar_canton(:p_cod_provincia, :p_nombre_canton); END;";
            $stid = oci_parse($conn, $sql);

            oci_bind_by_name($stid, ':p_cod_provincia', $data['cod_provincia']);
            oci_bind_by_name($stid, ':p_nombre_canton', $data['nombre_canton']);

            if (!oci_execute($stid)) {
                $e = oci_error($stid);
                http_response_code(400);
                echo json_encode(['error' => $e['message']]);
            } else {
                echo json_encode(['mensaje' => 'Cantón creado correctamente']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'El nombre del cantón y la provincia son requeridos']);
        }
        break;

    case 'PUT':
        // Actualizar canton
        if ($id && !empty($data['nombre_canton']) && !empty($data['cod_provincia'])) {

            $sql = "BEGIN actualizar_canton(:p_cod_canton, :p_cod_provincia, :p_nombre_canton); END;";
            $stid = oci_parse($conn, $sql);

            oci_bind_by_name($stid, ':p_cod_canton', $id);
            oci_bind_by_name($stid, ':p_cod_provincia', $data['cod_provincia']);
            oci_bind_by_name($stid, ':p_nombre_canton', $data['nombre_canton']);

            if (!oci_execute($stid)) {
                $e = oci_error($stid);
                http_response_code(400);
                echo json_encode(['error' => $e['message']]);
            } else {
                echo json_encode(['mensaje' => 'Cantón actualizado correctamente']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Datos incompletos']);
        }
        break;

    case 'DELETE':
        // Eliminar un canton
        if ($id) {
            $sql_check = "SELECT COUNT(*) as total FROM DISTRITOS WHERE cod_canton = :cod_canton";
            $stid = oci_parse($conn, $sql_check);
            oci_bind_by_name($stid, ':cod_canton', $id);
            oci_execute($stid);
            $row = oci_fetch_assoc($stid);

            if ($row['TOTAL'] > 0) {
                http_response_code(400);
                echo json_encode(['error' => 'No se puede eliminar el cantón porque tiene distritos asociados']);
                break;
            }

            $sql = "DELETE FROM CANTONES WHERE cod_canton = :cod_canton";
            $stid = oci_parse($conn, $sql);
            oci_bind_by_name($stid, ':cod_canton', $id);

            if (oci_execute($stid)) {
                if (oci_num_rows($stid) > 0) {
                    http_response_code(204);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Cantón no encontrado']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Error al eliminar el cantón']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID de cantón no especificado']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}

oci_close($conn);
