<?php

declare(strict_types=1);

namespace BlogApi;

use BlogApi\Controllers\AuthController;
use BlogApi\Controllers\CarouselController;
use BlogApi\Controllers\CategoryController;
use BlogApi\Controllers\EventController;
use BlogApi\Controllers\GalleryController;
use BlogApi\Controllers\HighlightsController;
use BlogApi\Controllers\SiteChromeController;
use BlogApi\Controllers\SiteHomeController;
use BlogApi\Controllers\NavigationController;
use BlogApi\Controllers\PostController;
use BlogApi\Controllers\ProfileController;
use BlogApi\Controllers\SitePageController;
use BlogApi\Controllers\StatsController;
use BlogApi\Controllers\UploadController;
use BlogApi\Handlers\ApiJsonErrorHandler;
use BlogApi\Middleware\AuthMiddleware;
use BlogApi\Middleware\CorsMiddleware;
use Slim\App;
use Slim\Routing\RouteCollectorProxy;

final class AppFactory
{
    public static function register(App $app): void
    {
        $container = $app->getContainer();

        $app->options('/{routes:.+}', function ($request, $response) {
            return $response->withStatus(204);
        });

        $app->group('/api/v1', function (RouteCollectorProxy $group) use ($container) {
            $group->get('/health', function ($request, $response) {
                $response->getBody()->write(json_encode(['status' => 'ok']));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $group->get('/health/db', function ($request, $response) use ($container) {
                try {
                    $pdo = $container->get(\PDO::class);
                    $pdo->query('SELECT 1');
                    $response->getBody()->write(json_encode(['ok' => true, 'database' => 'connected']));
                } catch (\Throwable $e) {
                    $response->getBody()->write(json_encode([
                        'ok' => false,
                        'error' => $e->getMessage(),
                        'hint' => 'Start MySQL (e.g. docker compose up -d), match api/.env DB_* and run php api/scripts/seed-database.php',
                    ], JSON_THROW_ON_ERROR));
                    return $response->withStatus(503)->withHeader('Content-Type', 'application/json');
                }
                return $response->withHeader('Content-Type', 'application/json');
            });

            $group->post('/auth/login', [AuthController::class, 'login']);

            $group->get('/posts', [PostController::class, 'listPublic']);
            $group->get('/posts/{slug}', [PostController::class, 'getBySlugPublic']);
            $group->get('/categories', [CategoryController::class, 'listPublic']);
            $group->get('/navigation', [NavigationController::class, 'treePublic']);
            $group->get('/carousel', [CarouselController::class, 'listPublic']);
            $group->get('/gallery', [GalleryController::class, 'listPublic']);
            $group->get('/events', [EventController::class, 'listPublic']);
            $group->get('/events/{slug}', [EventController::class, 'getBySlugPublic']);
            $group->get('/chrome', [SiteChromeController::class, 'getPublic']);
            $group->get('/home', [SiteHomeController::class, 'getPublic']);
            $group->get('/highlights', [HighlightsController::class, 'listPublic']);
            $group->get('/pages/{slug}', [SitePageController::class, 'getBySlugPublic']);

            $group->group('/admin', function (RouteCollectorProxy $admin) {
                $admin->get('/stats', [StatsController::class, 'overview']);

                $admin->get('/posts', [PostController::class, 'listAdmin']);
                $admin->post('/posts', [PostController::class, 'create']);
                $admin->get('/posts/id/{id:[0-9]+}', [PostController::class, 'getById']);
                $admin->put('/posts/{id:[0-9]+}', [PostController::class, 'update']);
                $admin->delete('/posts/{id:[0-9]+}', [PostController::class, 'delete']);

                $admin->get('/categories', [CategoryController::class, 'listAdmin']);
                $admin->post('/categories', [CategoryController::class, 'create']);
                $admin->put('/categories/{id:[0-9]+}', [CategoryController::class, 'update']);
                $admin->delete('/categories/{id:[0-9]+}', [CategoryController::class, 'delete']);

                $admin->get('/site-pages', [SitePageController::class, 'listAdmin']);
                $admin->get('/site-pages/slug/{slug}', [SitePageController::class, 'getAdminBySlug']);
                $admin->get('/site-pages/{id:[0-9]+}', [SitePageController::class, 'getAdmin']);
                $admin->post('/site-pages', [SitePageController::class, 'create']);
                $admin->put('/site-pages/{id:[0-9]+}', [SitePageController::class, 'update']);
                $admin->delete('/site-pages/{id:[0-9]+}', [SitePageController::class, 'delete']);

                $admin->get('/navigation', [NavigationController::class, 'listAdmin']);
                $admin->post('/navigation', [NavigationController::class, 'create']);
                $admin->put('/navigation/{id:[0-9]+}', [NavigationController::class, 'update']);
                $admin->delete('/navigation/{id:[0-9]+}', [NavigationController::class, 'delete']);

                $admin->get('/carousel', [CarouselController::class, 'listAdmin']);
                $admin->post('/carousel', [CarouselController::class, 'create']);
                $admin->put('/carousel/{id:[0-9]+}', [CarouselController::class, 'update']);
                $admin->delete('/carousel/{id:[0-9]+}', [CarouselController::class, 'delete']);

                $admin->get('/highlights', [HighlightsController::class, 'adminGet']);
                $admin->put('/highlights', [HighlightsController::class, 'updateAdmin']);

                $admin->get('/gallery', [GalleryController::class, 'listAdmin']);
                $admin->post('/gallery', [GalleryController::class, 'create']);
                $admin->put('/gallery/reorder', [GalleryController::class, 'reorder']);
                $admin->put('/gallery/{id:[0-9]+}', [GalleryController::class, 'update']);
                $admin->delete('/gallery/{id:[0-9]+}', [GalleryController::class, 'delete']);

                $admin->get('/events', [EventController::class, 'listAdmin']);
                $admin->get('/events/{id:[0-9]+}', [EventController::class, 'getAdmin']);
                $admin->post('/events', [EventController::class, 'create']);
                $admin->put('/events/{id:[0-9]+}', [EventController::class, 'update']);
                $admin->delete('/events/{id:[0-9]+}', [EventController::class, 'delete']);

                $admin->get('/chrome', [SiteChromeController::class, 'getAdmin']);
                $admin->put('/chrome', [SiteChromeController::class, 'updateAdmin']);

                $admin->get('/home', [SiteHomeController::class, 'getAdmin']);
                $admin->put('/home', [SiteHomeController::class, 'updateAdmin']);

                $admin->post('/uploads', [UploadController::class, 'upload']);
                $admin->post('/uploads/gallery', [UploadController::class, 'uploadGallery']);
                $admin->post('/uploads/pdf', [UploadController::class, 'uploadPdf']);

                $admin->get('/me', [ProfileController::class, 'me']);
                $admin->put('/me', [ProfileController::class, 'updateProfile']);
                $admin->put('/me/password', [ProfileController::class, 'updatePassword']);
            })->add($container->get(AuthMiddleware::class));
        });

        $app->addRoutingMiddleware();
        $displayDetails = filter_var($_ENV['APP_DEBUG'] ?? '0', FILTER_VALIDATE_BOOLEAN);
        $errorMiddleware = $app->addErrorMiddleware($displayDetails, true, true);
        $errorMiddleware->setDefaultErrorHandler(
            new ApiJsonErrorHandler($app->getResponseFactory())
        );
        $app->add(new CorsMiddleware());
    }
}
