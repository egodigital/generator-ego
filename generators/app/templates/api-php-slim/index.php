<?php

require 'vendor/autoload.php';

$app = new \Slim\App();

$app->get('/', function ($request, $response, $args) {
    $response->getBody()
             ->write("Hello, e.GO!");

    return $response;
});

$app->run();
