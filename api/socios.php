<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$sql = "
    SELECT 
        id_socio     AS ID_SOCIO,
        nombre_socio AS NOMBRE_SOCIO
    FROM socios
    WHERE estado_socio = 'A'
    ORDER BY nombre_socio
";

$stid = oci_parse($conn, $sql);
oci_execute($stid);

$socios = [];
while ($row = oci_fetch_assoc($stid)) {
    $socios[] = $row;
}
oci_free_statement($stid);

echo json_encode($socios);