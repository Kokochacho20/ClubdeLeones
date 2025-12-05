<?php
header('Content-Type: application/json; charset=utf-8');

// Conexión básica (ajusta según tu entorno Oracle/OCI/PDO)
$host = "localhost";
$user = "usuario";
$pass = "clave";
$db   = "XE"; // ejemplo de servicio Oracle

try {
    $conn = new PDO("oci:dbname=$db;charset=UTF8", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["ok" => false, "mensaje" => "Error de conexión: " . $e->getMessage()]);
    exit;
}

// Si es GET → listar actividades
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->query("SELECT id_tip_actividad, nombre_tip_actividad, tipo_actividad FROM tipo_actividad ORDER BY id_tip_actividad");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["ok" => false, "mensaje" => "Error al listar actividades"]);
    }
    exit;
}

// Si es POST → acciones CRUD
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $accion = $data['accion'] ?? '';

    try {
        if ($accion === 'crear') {
            $nombre = trim($data['nombre_tip_actividad'] ?? '');
            $tipo   = strtoupper(trim($data['tipo_actividad'] ?? 'C'));

            if (!$nombre || !in_array($tipo, ['I','C','G'])) {
                throw new Exception("Datos inválidos");
            }

            $sql = "INSERT INTO tipo_actividad (nombre_tip_actividad, tipo_actividad) VALUES (:nombre, :tipo)";
            $stmt = $conn->prepare($sql);
            $stmt->execute([":nombre" => $nombre, ":tipo" => $tipo]);

            echo json_encode(["ok" => true, "mensaje" => "Actividad creada correctamente"]);
        }

        elseif ($accion === 'eliminar') {
            $id = intval($data['id_tip_actividad'] ?? 0);
            if ($id <= 0) throw new Exception("ID inválido");

            $sql = "DELETE FROM tipo_actividad WHERE id_tip_actividad = :id";
            $stmt = $conn->prepare($sql);
            $stmt->execute([":id" => $id]);

            echo json_encode(["ok" => true, "mensaje" => "Actividad eliminada correctamente"]);
        }

        else {
            throw new Exception("Acción no reconocida");
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(["ok" => false, "mensaje" => $e->getMessage()]);
    }
    exit;
}
