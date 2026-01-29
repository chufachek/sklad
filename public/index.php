<?php
require_once __DIR__ . '/../vendor/bramus/Router.php';

use Bramus\Router\Router;

$router = new Router();

function render_page($page, $data = array())
{
    $title = isset($data['title']) ? $data['title'] : 'Easy склад';
    $layout = isset($data['layout']) ? $data['layout'] : 'app';
    $bodyPage = isset($data['bodyPage']) ? $data['bodyPage'] : '';
    $pageFile = __DIR__ . '/../views/pages/' . $page . '.php';

    if (!file_exists($pageFile)) {
        header('HTTP/1.0 404 Not Found');
        echo '404 Not Found';
        exit;
    }

    include __DIR__ . '/../views/partials/head.php';

    if ($layout === 'auth') {
        include $pageFile;
    } else {
        include __DIR__ . '/../views/partials/header.php';
        include __DIR__ . '/../views/partials/sidebar.php';
        include __DIR__ . '/../views/partials/breadcrumbs.php';
        echo '<main class="app-main">';
        include $pageFile;
        echo '</main>';
    }

    include __DIR__ . '/../views/partials/footer.php';
}

function require_auth($path)
{
    $publicPaths = array('/login', '/register');
    if (in_array($path, $publicPaths)) {
        return;
    }

    if (!isset($_COOKIE['authToken']) || $_COOKIE['authToken'] === '') {
        header('Location: /login');
        exit;
    }
}

$router->get('/', function () {
    header('Location: /dashboard');
    exit;
});

$router->get('/login', function () {
    render_page('login', array('title' => 'Вход — Easy склад', 'layout' => 'auth', 'bodyPage' => 'login'));
});

$router->get('/register', function () {
    render_page('register', array('title' => 'Регистрация — Easy склад', 'layout' => 'auth', 'bodyPage' => 'register'));
});

$router->get('/dashboard', function () {
    require_auth('/dashboard');
    render_page('dashboard', array('title' => 'Дашборд — Easy склад', 'bodyPage' => 'dashboard'));
});

$router->get('/pos', function () {
    require_auth('/pos');
    render_page('pos', array('title' => 'Касса — Easy склад', 'bodyPage' => 'pos'));
});

$router->get('/warehouses', function () {
    require_auth('/warehouses');
    render_page('warehouses', array('title' => 'Склады — Easy склад', 'bodyPage' => 'warehouses'));
});

$router->get('/products', function () {
    require_auth('/products');
    render_page('products', array('title' => 'Товары — Easy склад', 'bodyPage' => 'products'));
});

$router->get('/income', function () {
    require_auth('/income');
    render_page('income', array('title' => 'Приход — Easy склад', 'bodyPage' => 'income'));
});

$router->get('/orders', function () {
    require_auth('/orders');
    render_page('orders', array('title' => 'Заказы — Easy склад', 'bodyPage' => 'orders'));
});

$router->get('/orders/{id}', function ($id) {
    require_auth('/orders');
    render_page('order_view', array('title' => 'Заказ #' . htmlspecialchars($id), 'bodyPage' => 'orders'));
});

$router->get('/services', function () {
    require_auth('/services');
    render_page('services', array('title' => 'Услуги — Easy склад', 'bodyPage' => 'services'));
});

$router->get('/company', function () {
    require_auth('/company');
    render_page('company', array('title' => 'Компания — Easy склад', 'bodyPage' => 'company'));
});

$router->get('/profile', function () {
    require_auth('/profile');
    render_page('profile', array('title' => 'Профиль — Easy склад', 'bodyPage' => 'profile'));
});

$router->get('/logout', function () {
    setcookie('authToken', '', time() - 3600, '/');
    header('Location: /login');
    exit;
});

$router->set404(function () {
    header('HTTP/1.0 404 Not Found');
    echo '404 Not Found';
});

$router->run();
