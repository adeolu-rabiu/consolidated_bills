<?php

require __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Prometheus\CollectorRegistry;
use Prometheus\RenderTextFormat;
use Prometheus\Storage\InMemory;

$app = AppFactory::create();

// Optional: default root route
$app->get('/', function ($request, $response, $args) {
    $response->getBody()->write("Welcome to PHP Biller API");
    return $response;
});

// ✅ Metrics endpoint
$app->get('/metrics', function ($request, $response, $args) {
    $registry = new CollectorRegistry(new InMemory());
    $renderer = new RenderTextFormat();
    $metrics = $renderer->render($registry->getMetricFamilySamples());

    $response->getBody()->write($metrics);
    return $response
        ->withHeader('Content-Type', RenderTextFormat::MIME_TYPE)
        ->withStatus(200);
});

<?php
if ($_SERVER['REQUEST_URI'] === '/health') {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'ok']);
    exit;
});


$app->run();

