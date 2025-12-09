<?php
session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$usuario = isset($input['usuario']) ? trim($input['usuario']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';

if ($usuario === '' || $password === '') {
    echo json_encode(['ok' => false, 'mensaje' => 'Debe completar usuario y contraseña']);
    exit;
}

$usuarios = [
    'admin' => 'admin123',
    'tesorero' => 'tesorero123'
];

if (array_key_exists($usuario, $usuarios) && $usuarios[$usuario] === $password) {
    $_SESSION['usuario'] = $usuario;
    echo json_encode(['ok' => true, 'usuario' => $usuario]);
    exit;
}

echo json_encode(['ok' => false, 'mensaje' => 'Credenciales inválidas']);