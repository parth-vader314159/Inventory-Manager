<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = $_GET['action'] ?? '';

switch($method) {
    case 'GET':
        if($request == 'all') {
            getAllProducts($pdo);
        } elseif($request == 'single' && isset($_GET['id'])) {
            getProduct($pdo, $_GET['id']);
        }
        break;
    
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if($request == 'add') {
            addProduct($pdo, $data);
        }
        break;
    
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if($request == 'update') {
            updateProduct($pdo, $data);
        }
        break;
    
    case 'DELETE':
        if($request == 'delete' && isset($_GET['id'])) {
            deleteProduct($pdo, $_GET['id']);
        }
        break;
}

function getAllProducts($pdo) {
    $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function getProduct($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

function addProduct($pdo, $data) {
    $stmt = $pdo->prepare("INSERT INTO products (product_name, category, quantity, price, supplier) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$data['product_name'], $data['category'], $data['quantity'], $data['price'], $data['supplier']]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
}

function updateProduct($pdo, $data) {
    $stmt = $pdo->prepare("UPDATE products SET product_name=?, category=?, quantity=?, price=?, supplier=? WHERE id=?");
    $stmt->execute([$data['product_name'], $data['category'], $data['quantity'], $data['price'], $data['supplier'], $data['id']]);
    echo json_encode(['success' => true]);
}

function deleteProduct($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}
?>