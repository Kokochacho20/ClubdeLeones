<?php

require_once __DIR__ . '/db.php';

$conn = getConnection(); 

echo "<pre>";

echo "OK conexión como usuario: ADMJDRU\n";

$sql = "SELECT table_name FROM user_tables";
$stid = oci_parse($conn, $sql);
oci_execute($stid);

while ($r = oci_fetch_assoc($stid)) {
    echo $r['TABLE_NAME'] . "\n";
}