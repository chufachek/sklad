<?php
namespace Bramus\Router;

class Router
{
    private $routes = array();
    private $notFoundHandler;

    public function get($pattern, $handler)
    {
        $this->addRoute('GET', $pattern, $handler);
    }

    public function post($pattern, $handler)
    {
        $this->addRoute('POST', $pattern, $handler);
    }

    public function match($methods, $pattern, $handler)
    {
        $methods = is_array($methods) ? $methods : explode('|', $methods);
        foreach ($methods as $method) {
            $this->addRoute(strtoupper($method), $pattern, $handler);
        }
    }

    public function set404($handler)
    {
        $this->notFoundHandler = $handler;
    }

    private function addRoute($method, $pattern, $handler)
    {
        $this->routes[] = array(
            'method' => $method,
            'pattern' => $this->convertPattern($pattern),
            'handler' => $handler
        );
    }

    private function convertPattern($pattern)
    {
        $pattern = rtrim($pattern, '/');
        if ($pattern === '') {
            $pattern = '/';
        }
        $pattern = preg_replace('#\{([^/]+)\}#', '(?P<$1>[^/]+)', $pattern);
        return '#^' . $pattern . '/?$#';
    }

    public function run()
    {
        $method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
        $uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
        $uri = parse_url($uri, PHP_URL_PATH);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            if (preg_match($route['pattern'], $uri, $matches)) {
                $params = array();
                foreach ($matches as $key => $value) {
                    if (!is_int($key)) {
                        $params[] = $value;
                    }
                }
                return call_user_func_array($route['handler'], $params);
            }
        }

        if ($this->notFoundHandler) {
            call_user_func($this->notFoundHandler);
        } else {
            header('HTTP/1.0 404 Not Found');
            echo '404 Not Found';
        }
    }
}
