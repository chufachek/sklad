<?php
$publicIndex = __DIR__ . '/public/index.php';

if (!file_exists($publicIndex)) {
    header('HTTP/1.0 500 Internal Server Error');
    echo '500 Internal Server Error: public/index.php not found.';
    exit;
}

require $publicIndex;
