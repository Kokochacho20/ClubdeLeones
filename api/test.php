<?php
require_once 'db.php';

echo "<pre>Conexión correcta como usuario: $ora_user\n";

$sql = "SELECT table_name FROM user_tables";
$stid = oci_parse($conn, $sql);
oci_execute($stid);

echo "Tablas encontradas:\n";
while ($row = oci_fetch_assoc($stid)) {
    echo " - " . $row['TABLE_NAME'] . "\n";
}
?>
