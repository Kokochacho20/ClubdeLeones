<?php
function getConnection()
{
    $ora_user = "ADMLEON";
    $ora_pass = "ADMLEON";
    $ora_conn_str = "//localhost:1521/XE";

    $conn = oci_connect($ora_user, $ora_pass, $ora_conn_str, 'AL32UTF8');

    if (!$conn) {
        return false;
    }

    return $conn;
}
