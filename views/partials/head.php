<?php
if (!isset($title)) {
    $title = 'Easy склад';
}
if (!isset($bodyPage)) {
    $bodyPage = '';
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($title); ?></title>
    <link rel="stylesheet" href="/assets/css/themes.css">
    <link rel="stylesheet" href="/assets/css/components.css">
    <link rel="stylesheet" href="/assets/css/app.css">
</head>
<body data-page="<?php echo htmlspecialchars($bodyPage); ?>">
