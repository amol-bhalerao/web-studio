<?php

declare(strict_types=1);

use BlogApi\AppFactory;
use DI\ContainerBuilder;
use Slim\Factory\AppFactory as SlimAppFactory;

require __DIR__ . '/../vendor/autoload.php';

$root = dirname(__DIR__);
if (is_readable($root . '/.env')) {
    \Dotenv\Dotenv::createImmutable($root)->safeLoad();
}

$containerBuilder = new ContainerBuilder();
$containerBuilder->useAutowiring(true);
$containerBuilder->addDefinitions($root . '/src/container.php');
$container = $containerBuilder->build();

SlimAppFactory::setContainer($container);
$app = SlimAppFactory::createFromContainer($container);

/** Subdirectory installs (e.g. Hostinger: public_html/api/index.php → base path /api). */
$configured = trim((string) ($_ENV['APP_BASE_PATH'] ?? ''), '/');
if ($configured !== '') {
    $app->setBasePath('/' . $configured);
} else {
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    $dir = $scriptName !== '' ? str_replace('\\', '/', dirname($scriptName)) : '';
    if ($dir !== '' && $dir !== '/' && $dir !== '.') {
        $app->setBasePath(rtrim($dir, '/'));
    }
}

AppFactory::register($app);

$app->run();
