<?php
function getConnection()
{
    $ora_user = "ADMLEON";
    $ora_pass = "ADMLEON";
    $ora_conn_str = "//localhost:1521/XE";

    $conn = oci_connect($ora_user, $ora_pass, $ora_conn_str, 'AL32UTF8');

    if (!$conn) {
        $e = oci_error();
        die("ERROR de conexion: " . $e['message']);
    }

    return $conn;
}
