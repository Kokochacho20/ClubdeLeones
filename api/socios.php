<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

$conn   = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? $_GET['id'] : null;

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) $data = [];

/* ------------------ GET ------------------ */
if ($method === 'GET') {

  // detalle
  if ($id) {
    $sql = "SELECT 
              id_socio,
              nombre_socio,
              TO_CHAR(fecha_nacimiento,'YYYY-MM-DD') AS fecha_nacimiento,
              TO_CHAR(fecha_ingreso,'YYYY-MM-DD')   AS fecha_ingreso,
              número_socio AS numero_socio,
              cod_distrito,
              desc_direccion,
              telefono1,
              telefono2,
              tipo_socio,
              estado_socio
            FROM socios
            WHERE id_socio = :id";

    $stid = oci_parse($conn, $sql);
    oci_bind_by_name($stid, ':id', $id);

    if (!@oci_execute($stid)) {
      $e = oci_error($stid);
      http_response_code(500);
      echo json_encode(['ok' => false, 'error' => $e['message']]);
      exit;
    }

    $row = oci_fetch_assoc($stid);
    if (!$row) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Socio no encontrado']);
      exit;
    }

    echo json_encode($row);
    exit;
  }

  // listado
  $sql = "SELECT 
            s.id_socio,
            s.nombre_socio,
            TO_CHAR(s.fecha_nacimiento,'YYYY-MM-DD') AS fecha_nacimiento,
            TO_CHAR(s.fecha_ingreso,'YYYY-MM-DD')   AS fecha_ingreso,
            s.número_socio AS numero_socio,
            s.cod_distrito,
            s.desc_direccion,
            s.telefono1,
            s.telefono2,
            s.tipo_socio,
            s.estado_socio,
            d.nombre_distrito,
            c.nombre_canton,
            p.nombre_provincia
          FROM socios s
          LEFT JOIN distritos  d ON s.cod_distrito = d.cod_distrito
          LEFT JOIN cantones   c ON d.cod_canton   = c.cod_canton
          LEFT JOIN provincias p ON c.cod_provincia = p.cod_provincia
          ORDER BY s.nombre_socio";

  $stid = oci_parse($conn, $sql);

  if (!@oci_execute($stid)) {
    $e = oci_error($stid);
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e['message']]);
    exit;
  }

  $socios = [];
  while ($row = oci_fetch_assoc($stid)) {
    $socios[] = $row;
  }

  echo json_encode($socios);
  exit;
}

/* ------------------ POST (insertar_socio) ------------------ */
if ($method === 'POST') {

  $nombre_socio     = trim($data['nombre_socio']     ?? '');
  $fecha_nacimiento = $data['fecha_nacimiento']      ?? null; // 'YYYY-MM-DD' o null
  $fecha_ingreso    = $data['fecha_ingreso']         ?? null; // requerido
  $numero_socio     = $data['numero_socio']          ?? null;
  $cod_distrito     = $data['cod_distrito']          ?? null;
  $desc_direccion   = $data['desc_direccion']        ?? null;
  $telefono1        = $data['telefono1']             ?? null;
  $telefono2        = $data['telefono2']             ?? null;
  $tipo_socio       = $data['tipo_socio']            ?? null;
  $estado_socio     = $data['estado_socio']          ?? null;

  if (!$nombre_socio || !$fecha_ingreso || !$numero_socio || !$telefono1 || !$tipo_socio || !$estado_socio) {
    http_response_code(400);
    echo json_encode([
      'ok'    => false,
      'error' => 'Faltan datos obligatorios (nombre, fecha_ingreso, numero_socio, telefono1, tipo_socio, estado_socio)'
    ]);
    exit;
  }

  $plsql = "BEGIN insertar_socio(
              :p_nombre_socio,
              CASE 
                  WHEN :p_fecha_nacimiento IS NOT NULL 
                  THEN TO_DATE(:p_fecha_nacimiento, 'YYYY-MM-DD') 
                  ELSE NULL 
              END,
              TO_DATE(:p_fecha_ingreso, 'YYYY-MM-DD'),
              :p_numero_socio,
              :p_cod_distrito,
              :p_desc_direccion,
              :p_telefono1,
              :p_telefono2,
              :p_tipo_socio,
              :p_estado_socio
          ); END;";


  $stid = oci_parse($conn, $plsql);

  oci_bind_by_name($stid, ':p_nombre_socio',     $nombre_socio);
  oci_bind_by_name($stid, ':p_fecha_nacimiento', $fecha_nacimiento);
  oci_bind_by_name($stid, ':p_fecha_ingreso',    $fecha_ingreso);
  oci_bind_by_name($stid, ':p_numero_socio',     $numero_socio);
  oci_bind_by_name($stid, ':p_cod_distrito',     $cod_distrito);
  oci_bind_by_name($stid, ':p_desc_direccion',   $desc_direccion);
  oci_bind_by_name($stid, ':p_telefono1',        $telefono1);
  oci_bind_by_name($stid, ':p_telefono2',        $telefono2);
  oci_bind_by_name($stid, ':p_tipo_socio',       $tipo_socio);
  oci_bind_by_name($stid, ':p_estado_socio',     $estado_socio);

  if (!@oci_execute($stid)) {
    $e = oci_error($stid);
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $e['message']]);
    exit;
  }

  echo json_encode(['ok' => true, 'mensaje' => 'Socio creado correctamente']);
  exit;
}

/* ------------------ PUT (actualizar_socio) ------------------ */
if ($method === 'PUT') {

  if (!$id) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'ID de socio no especificado']);
    exit;
  }

  $nombre_socio     = trim($data['nombre_socio']     ?? '');
  $fecha_nacimiento = $data['fecha_nacimiento']      ?? null;
  $fecha_ingreso    = $data['fecha_ingreso']         ?? null;
  $numero_socio     = $data['numero_socio']          ?? null;
  $cod_distrito     = $data['cod_distrito']          ?? null;
  $desc_direccion   = $data['desc_direccion']        ?? null;
  $telefono1        = $data['telefono1']             ?? null;
  $telefono2        = $data['telefono2']             ?? null;
  $tipo_socio       = $data['tipo_socio']            ?? null;
  $estado_socio     = $data['estado_socio']          ?? null;

  if (!$nombre_socio || !$fecha_ingreso || !$numero_socio || !$telefono1 || !$tipo_socio || !$estado_socio) {
    http_response_code(400);
    echo json_encode([
      'ok'    => false,
      'error' => 'Faltan datos obligatorios para actualizar socio'
    ]);
    exit;
  }

  $plsql = "BEGIN actualizar_socio(
              :p_id_socio,
              :p_nombre_socio,
              CASE 
                  WHEN :p_fecha_nacimiento IS NOT NULL 
                  THEN TO_DATE(:p_fecha_nacimiento, 'YYYY-MM-DD')
                  ELSE NULL
              END,
              TO_DATE(:p_fecha_ingreso, 'YYYY-MM-DD'),
              :p_numero_socio,
              :p_cod_distrito,
              :p_desc_direccion,
              :p_telefono1,
              :p_telefono2,
              :p_tipo_socio,
              :p_estado_socio
          ); END;";


  $stid = oci_parse($conn, $plsql);

  oci_bind_by_name($stid, ':p_id_socio',         $id);
  oci_bind_by_name($stid, ':p_nombre_socio',     $nombre_socio);
  oci_bind_by_name($stid, ':p_fecha_nacimiento', $fecha_nacimiento);
  oci_bind_by_name($stid, ':p_fecha_ingreso',    $fecha_ingreso);
  oci_bind_by_name($stid, ':p_numero_socio',     $numero_socio);
  oci_bind_by_name($stid, ':p_cod_distrito',     $cod_distrito);
  oci_bind_by_name($stid, ':p_desc_direccion',   $desc_direccion);
  oci_bind_by_name($stid, ':p_telefono1',        $telefono1);
  oci_bind_by_name($stid, ':p_telefono2',        $telefono2);
  oci_bind_by_name($stid, ':p_tipo_socio',       $tipo_socio);
  oci_bind_by_name($stid, ':p_estado_socio',     $estado_socio);

  if (!@oci_execute($stid)) {
    $e = oci_error($stid);
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $e['message']]);
    exit;
  }

  echo json_encode(['ok' => true, 'mensaje' => 'Socio actualizado correctamente']);
  exit;
}

/* ------------------ DELETE (eliminar_socio) ------------------ */
if ($method === 'DELETE') {

  if (!$id) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'ID de socio no especificado']);
    exit;
  }

  $plsql = "BEGIN eliminar_socio(:p_id_socio); END;";
  $stid  = oci_parse($conn, $plsql);
  oci_bind_by_name($stid, ':p_id_socio', $id);

  if (!@oci_execute($stid)) {
    $e = oci_error($stid);
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $e['message']]);
    exit;
  }

  http_response_code(204);
  exit;
}

/* metodo no permitido */
http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Metodo no permitido']);

oci_close($conn);
