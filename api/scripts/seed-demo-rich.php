<?php

/**
 * Optional richer demo content (carousel, events, gallery) for QA / screenshots.
 * Safe to run multiple times — skips tables that already have rows.
 *
 *   php api/scripts/seed-demo-rich.php
 */
declare(strict_types=1);

$apiRoot = dirname(__DIR__);
require $apiRoot . '/vendor/autoload.php';

if (is_readable($apiRoot . '/.env')) {
    \Dotenv\Dotenv::createImmutable($apiRoot)->safeLoad();
}

$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
    $_ENV['DB_HOST'] ?? '127.0.0.1',
    $_ENV['DB_PORT'] ?? '3306',
    $_ENV['DB_NAME'] ?? 'blog_mfe'
);
$user = $_ENV['DB_USER'] ?? 'blog';
$pass = $_ENV['DB_PASS'] ?? 'blog_secret';

try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $e) {
    fwrite(STDERR, 'DB connection failed: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}

function countRows(PDO $pdo, string $table): int
{
    return (int) $pdo->query('SELECT COUNT(*) FROM `' . str_replace('`', '', $table) . '`')->fetchColumn();
}

if (countRows($pdo, 'carousel_slides') === 0) {
    echo "Seeding carousel_slides …\n";
    $st = $pdo->prepare(
        'INSERT INTO carousel_slides (sort_order, title, excerpt, image_url, body_html, link_post_id, link_url)
         VALUES (?, ?, ?, ?, ?, NULL, NULL)'
    );
    $st->execute([
        0,
        'Welcome day',
        'Orientation and campus tours for new students.',
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80&auto=format&fit=crop',
        '<p>Join department booths, library tours, and club sign-ups.</p>',
    ]);
    $st->execute([
        1,
        'Research symposium',
        'Faculty and students present posters and talks.',
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600&q=80&auto=format&fit=crop',
        '<p>Open to alumni and partners.</p>',
    ]);
}

if (countRows($pdo, 'events') === 0) {
    echo "Seeding events …\n";
    $st = $pdo->prepare(
        'INSERT INTO events (slug, title, excerpt, content_html, sort_order, status, published_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())'
    );
    $st->execute([
        'annual-sports-meet',
        'Annual sports meet',
        'Track and field, team sports, and awards.',
        '<p>Schedule TBA. All students encouraged to participate or volunteer.</p>',
        1,
        'published',
    ]);
    $st->execute([
        'library-workshop',
        'Library research workshop',
        'Learn citation tools and database search.',
        '<p>Bring your laptop. Limited seats — register at the desk.</p>',
        2,
        'published',
    ]);
}

if (countRows($pdo, 'gallery_items') === 0) {
    echo "Seeding gallery_items …\n";
    $st = $pdo->prepare(
        'INSERT INTO gallery_items (sort_order, media_type, url, caption) VALUES (?, ?, ?, ?)'
    );
    $st->execute([
        0,
        'image',
        'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&q=80&auto=format&fit=crop',
        'Campus quad',
    ]);
    $st->execute([
        1,
        'image',
        'https://images.unsplash.com/photo-1498243695101-7722ccc765fe?w=1200&q=80&auto=format&fit=crop',
        'Library reading room',
    ]);
    $st->execute([
        2,
        'image',
        'https://images.unsplash.com/photo-1519337265831-281c6cc44841?w=1200&q=80&auto=format&fit=crop',
        'Lab session',
    ]);
}

echo "Done.\n";
