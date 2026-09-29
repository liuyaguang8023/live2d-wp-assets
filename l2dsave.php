<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $img = $_POST['img'] ?? '';
    if ($img) {
        $fn = '/var/www/html/l2dimg_' . date('His') . '_' . uniqid() . '.png';
        @file_put_contents($fn, base64_decode($img));
        echo $fn;
    }
}
