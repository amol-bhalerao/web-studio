<?php

/**
 * Idempotent: creates schema if missing, seeds if tables are empty.
 * Run: php api/scripts/seed-database.php
 * From api dir: php scripts/seed-database.php
 */
declare(strict_types=1);

$apiRoot = dirname(__DIR__);
require $apiRoot . '/vendor/autoload.php';

if (is_readable($apiRoot . '/.env')) {
    \Dotenv\Dotenv::createImmutable($apiRoot)->safeLoad();
}

$projectRoot = dirname($apiRoot);
$schemaFile = $projectRoot . '/database/schema.sql';
$seedFile = $projectRoot . '/database/seed.sql';

$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
    $_ENV['DB_HOST'] ?? '127.0.0.1',
    $_ENV['DB_PORT'] ?? '3306',
    $_ENV['DB_NAME'] ?? 'blog_mfe'
);
$user = $_ENV['DB_USER'] ?? 'blog';
$pass = $_ENV['DB_PASS'] ?? 'blog_secret';

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (PDOException $e) {
    fwrite(STDERR, "Cannot connect to MySQL: " . $e->getMessage() . PHP_EOL);
    fwrite(STDERR, "Ensure MySQL is running (e.g. docker compose up -d) and api/.env matches." . PHP_EOL);
    exit(1);
}

/** Add categories.parent_id for existing databases created before hierarchy support. */
function migrateCategoriesParent(PDO $pdo): void
{
    $db = $pdo->query('SELECT DATABASE()')->fetchColumn();
    $st = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?'
    );
    $st->execute([$db, 'categories', 'parent_id']);
    if ((int) $st->fetchColumn() > 0) {
        return;
    }
    echo "Migrating categories: adding parent_id …\n";
    $pdo->exec(
        'ALTER TABLE categories
         ADD COLUMN parent_id INT UNSIGNED NULL AFTER id,
         ADD KEY idx_categories_parent (parent_id),
         ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL'
    );
    echo "Migration OK.\n";
}

migrateCategoriesParent($pdo);
migrateSitePagesNav($pdo);
migrateExtendedContent($pdo);
migrateGalleryTable($pdo);
migrateEventsAndSiteChrome($pdo);
migratePostsPdfUserProfile($pdo);
ensureNewsEventsSitePage($pdo);
migrateSiteHome($pdo);

function migrateExtendedContent(PDO $pdo): void
{
    $db = $pdo->query('SELECT DATABASE()')->fetchColumn();
    $chk = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?'
    );
    $chk->execute([$db, 'nav_items', 'post_id']);
    if ((int) $chk->fetchColumn() === 0) {
        echo "Adding nav_items.post_id …\n";
        try {
            $pdo->exec(
                'ALTER TABLE nav_items
                 ADD COLUMN post_id INT UNSIGNED NULL AFTER page_id,
                 ADD KEY idx_nav_post (post_id),
                 ADD CONSTRAINT fk_nav_items_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL'
            );
            echo "nav_items.post_id OK.\n";
        } catch (PDOException $e) {
            fwrite(STDERR, 'nav_items.post_id migration skipped: ' . $e->getMessage() . PHP_EOL);
        }
    }

    $tb = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?'
    );
    $tb->execute([$db, 'carousel_slides']);
    if ((int) $tb->fetchColumn() === 0) {
        echo "Creating carousel_slides …\n";
        $pdo->exec(
            'CREATE TABLE carousel_slides (
              id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
              sort_order INT NOT NULL DEFAULT 0,
              title VARCHAR(500) NOT NULL,
              excerpt TEXT NULL,
              image_url VARCHAR(1024) NOT NULL,
              body_html MEDIUMTEXT NULL,
              link_post_id INT UNSIGNED NULL,
              link_url VARCHAR(1024) NULL,
              KEY idx_carousel_sort (sort_order),
              CONSTRAINT fk_carousel_link_post FOREIGN KEY (link_post_id) REFERENCES posts(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
        echo "carousel_slides OK.\n";
    }

    $tb->execute([$db, 'highlight_slots']);
    if ((int) $tb->fetchColumn() === 0) {
        echo "Creating highlight_slots …\n";
        $pdo->exec(
            'CREATE TABLE highlight_slots (
              slot_key VARCHAR(16) NOT NULL PRIMARY KEY,
              post_id INT UNSIGNED NULL,
              CONSTRAINT fk_highlight_slot_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
        echo "highlight_slots OK.\n";
    }

    try {
        $pdo->exec(
            "INSERT IGNORE INTO highlight_slots (slot_key, post_id) VALUES ('news', NULL), ('events', NULL)"
        );
    } catch (PDOException $e) {
        // ignore if duplicate or table missing
    }
}

function migrateGalleryTable(PDO $pdo): void
{
    $db = $pdo->query('SELECT DATABASE()')->fetchColumn();
    $tb = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?'
    );
    $tb->execute([$db, 'gallery_items']);
    if ((int) $tb->fetchColumn() > 0) {
        return;
    }
    echo "Creating gallery_items …\n";
    $pdo->exec(
        'CREATE TABLE gallery_items (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          sort_order INT NOT NULL DEFAULT 0,
          media_type ENUM(\'image\',\'video\') NOT NULL,
          url VARCHAR(1024) NOT NULL,
          caption VARCHAR(500) NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          KEY idx_gallery_sort (sort_order)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
    echo "gallery_items OK.\n";
}

function migrateEventsAndSiteChrome(PDO $pdo): void
{
    $db = $pdo->query('SELECT DATABASE()')->fetchColumn();
    $tb = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?'
    );
    $tb->execute([$db, 'events']);
    if ((int) $tb->fetchColumn() === 0) {
        echo "Creating events …\n";
        $pdo->exec(
            'CREATE TABLE events (
              id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
              slug VARCHAR(200) NOT NULL,
              title VARCHAR(500) NOT NULL,
              excerpt TEXT NULL,
              content_html MEDIUMTEXT NOT NULL,
              sort_order INT NOT NULL DEFAULT 0,
              status ENUM(\'draft\',\'published\') NOT NULL DEFAULT \'draft\',
              published_at DATETIME NULL,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY uq_events_slug (slug),
              KEY idx_events_pub (status, published_at),
              KEY idx_events_sort (sort_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
        echo "events OK.\n";
    }
    $tb->execute([$db, 'site_chrome']);
    if ((int) $tb->fetchColumn() === 0) {
        echo "Creating site_chrome …\n";
        $pdo->exec(
            'CREATE TABLE site_chrome (
              id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
              header_json LONGTEXT NOT NULL,
              footer_json LONGTEXT NOT NULL,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
        // Store minimal JSON; controller merges defaults on read.
        $pdo->exec(
            "INSERT INTO site_chrome (id, header_json, footer_json) VALUES (1, '{}', '{}')"
        );
        echo "site_chrome OK.\n";
    }
}

function migratePostsPdfUserProfile(PDO $pdo): void
{
    $db = $pdo->query('SELECT DATABASE()')->fetchColumn();
    $chk = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?'
    );
    $chk->execute([$db, 'posts', 'pdf_url']);
    if ((int) $chk->fetchColumn() === 0) {
        echo "Adding posts.pdf_url …\n";
        try {
            $pdo->exec('ALTER TABLE posts ADD COLUMN pdf_url VARCHAR(1024) NULL AFTER cover_image_url');
            echo "posts.pdf_url OK.\n";
        } catch (PDOException $e) {
            fwrite(STDERR, 'posts.pdf_url: ' . $e->getMessage() . PHP_EOL);
        }
    }
    $chk->execute([$db, 'users', 'display_name']);
    if ((int) $chk->fetchColumn() === 0) {
        echo "Adding users.display_name …\n";
        try {
            $pdo->exec('ALTER TABLE users ADD COLUMN display_name VARCHAR(160) NULL AFTER email');
            echo "users.display_name OK.\n";
        } catch (PDOException $e) {
            fwrite(STDERR, 'users.display_name: ' . $e->getMessage() . PHP_EOL);
        }
    }
}

function ensureNewsEventsSitePage(PDO $pdo): void
{
    try {
        $st = $pdo->prepare('SELECT id FROM site_pages WHERE slug = ? LIMIT 1');
        $st->execute(['news-events']);
        if ($st->fetch()) {
            return;
        }
        $ins = $pdo->prepare(
            'INSERT INTO site_pages (slug, title, content_html) VALUES (?, ?, ?)'
        );
        $ins->execute([
            'news-events',
            'News & events',
            '<p>Add updates for your audience here. Edit this in <strong>Admin → News & events</strong>.</p>',
        ]);
        echo "Reserved site page slug news-events created.\n";
    } catch (PDOException $e) {
        fwrite(STDERR, 'ensureNewsEventsSitePage: ' . $e->getMessage() . PHP_EOL);
    }
}

function migrateSiteHome(PDO $pdo): void
{
    $db = $pdo->query('SELECT DATABASE()')->fetchColumn();
    $tb = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?'
    );
    $tb->execute([$db, 'site_home']);
    if ((int) $tb->fetchColumn() === 0) {
        echo "Creating site_home …\n";
        $pdo->exec(
            'CREATE TABLE site_home (
              id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
              content_json LONGTEXT NOT NULL,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
        echo "site_home OK.\n";
    }
    $n = (int) $pdo->query('SELECT COUNT(*) FROM site_home')->fetchColumn();
    if ($n === 0) {
        $defaults = [
            'hero' => [
                'title' => 'Welcome',
                'subtitle' => 'Share updates, pages, and media—tailored to your organization.',
                'tagline' => 'Multipurpose template · CMS-ready · API-driven content',
                'image_url' => '',
                'primary_cta_label' => 'About',
                'primary_cta_href' => '/p/about',
                'secondary_cta_label' => 'News & events',
                'secondary_cta_href' => '/p/news-events',
                'stats' => [
                    ['label' => 'Focus areas', 'value' => 'Custom'],
                    ['label' => 'Updates', 'value' => 'Posts'],
                    ['label' => 'Reach', 'value' => 'Your audience'],
                ],
            ],
            'sections' => [
                [
                    'id' => 'intro-mission',
                    'heading' => 'Your story',
                    'subheading' => 'Tell visitors who you are',
                    'body_html' => '<p>Edit this section in <strong>Web Studio → Home page</strong>. Use it for a mission statement, services overview, or anything that introduces your brand.</p>',
                    'variant' => 'default',
                ],
                [
                    'id' => 'programs-spotlight',
                    'heading' => 'Highlights',
                    'subheading' => 'Products, services, or initiatives',
                    'body_html' => '<p>Describe what you offer—programs, services, or campaigns. Replace this copy with content that fits your organization.</p>',
                    'variant' => 'muted',
                ],
                [
                    'id' => 'campus-life',
                    'heading' => 'Go deeper',
                    'subheading' => 'Resources & community',
                    'body_html' => '<p>Point readers to site pages, downloads, events, or contact forms. Everything here is configurable without code changes.</p>',
                    'variant' => 'accent',
                ],
            ],
            'show_latest_posts' => true,
            'latest_posts_heading' => 'Latest updates',
            'latest_posts_intro' => 'Articles and announcements from your team—managed in Web Studio.',
        ];
        $json = json_encode($defaults, JSON_THROW_ON_ERROR);
        $pdo->prepare('INSERT INTO site_home (id, content_json) VALUES (1, ?)')->execute([$json]);
        echo "site_home default row inserted.\n";
    }
}

function migrateSitePagesNav(PDO $pdo): void
{
    $db = $pdo->query('SELECT DATABASE()')->fetchColumn();
    $st = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?'
    );
    $st->execute([$db, 'site_pages']);
    if ((int) $st->fetchColumn() > 0) {
        return;
    }
    echo "Creating site_pages & nav_items …\n";
    $pdo->exec(
        'CREATE TABLE site_pages (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          slug VARCHAR(200) NOT NULL,
          title VARCHAR(300) NOT NULL,
          content_html MEDIUMTEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_site_pages_slug (slug)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
    $pdo->exec(
        'CREATE TABLE nav_items (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          parent_id INT UNSIGNED NULL,
          sort_order INT NOT NULL DEFAULT 0,
          label VARCHAR(160) NOT NULL,
          page_id INT UNSIGNED NULL,
          url VARCHAR(1024) NULL,
          KEY idx_nav_parent (parent_id),
          KEY idx_nav_page (page_id),
          KEY idx_nav_sort (parent_id, sort_order),
          CONSTRAINT fk_nav_items_parent FOREIGN KEY (parent_id) REFERENCES nav_items(id) ON DELETE CASCADE,
          CONSTRAINT fk_nav_items_page FOREIGN KEY (page_id) REFERENCES site_pages(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
    echo "Site tables OK.\n";
}

function seedDefaultSiteNavIfEmpty(PDO $pdo): void
{
    try {
        $t = (int) $pdo->query(
            "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_pages'"
        )->fetchColumn();
        if ($t === 0) {
            return;
        }
        $n = (int) $pdo->query('SELECT COUNT(*) FROM site_pages')->fetchColumn();
        if ($n > 0) {
            return;
        }
    } catch (PDOException $e) {
        return;
    }
    echo "Seeding default site pages & navigation …\n";
    $pdo->exec(
        "INSERT INTO site_pages (slug, title, content_html) VALUES
        ('about', 'About', '<div class=\"prose-blog\"><p>Introduce your organization here. Edit under Admin → Site pages.</p></div>'),
        ('gallery', 'Gallery', '<div class=\"prose-blog\"><p>Gallery placeholder.</p></div>'),
        ('contact', 'Contact', '<div class=\"prose-blog\"><p>Contact details — update in Admin.</p></div>')"
    );
    $pdo->exec(
        "INSERT INTO nav_items (parent_id, sort_order, label, page_id, url)
        SELECT NULL, 0, 'About', id, NULL FROM site_pages WHERE slug = 'about' LIMIT 1"
    );
    $pdo->exec(
        "INSERT INTO nav_items (parent_id, sort_order, label, page_id, url)
        SELECT NULL, 1, 'Gallery', id, NULL FROM site_pages WHERE slug = 'gallery' LIMIT 1"
    );
    $pdo->exec(
        "INSERT INTO nav_items (parent_id, sort_order, label, page_id, url)
        SELECT NULL, 2, 'Contact', id, NULL FROM site_pages WHERE slug = 'contact' LIMIT 1"
    );
    echo "Site nav seed OK.\n";
}

function splitSqlStatements(string $sql): array
{
    $lines = preg_split('/\r\n|\r|\n/', $sql) ?: [];
    $buf = [];
    foreach ($lines as $line) {
        $t = trim($line);
        if ($t === '' || str_starts_with($t, '--')) {
            continue;
        }
        $buf[] = $line;
    }
    $merged = implode("\n", $buf);
    $chunks = preg_split('/;\s*\n/', $merged) ?: [];
    $out = [];
    foreach ($chunks as $c) {
        $c = trim($c);
        if ($c !== '') {
            $out[] = $c;
        }
    }
    return $out;
}

$tables = (int) $pdo->query(
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('users','posts','categories')"
)->fetchColumn();

if ($tables < 3) {
    echo "Applying schema from database/schema.sql …\n";
    if (!is_readable($schemaFile)) {
        fwrite(STDERR, "Missing file: $schemaFile\n");
        exit(1);
    }
    $schema = file_get_contents($schemaFile);
    $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
    foreach (splitSqlStatements($schema) as $stmt) {
        $pdo->exec($stmt . ';');
    }
    $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
    echo "Schema OK.\n";
}

$userCount = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
if ($userCount === 0) {
    echo "Seeding data from database/seed.sql …\n";
    if (!is_readable($seedFile)) {
        fwrite(STDERR, "Missing file: $seedFile\n");
        exit(1);
    }
    $seed = file_get_contents($seedFile);
    foreach (splitSqlStatements($seed) as $stmt) {
        $pdo->exec($stmt . ';');
    }
    echo "Seed OK. Login: admin@example.com / ChangeMe!Admin1\n";
} else {
    echo "Database already has data ($userCount user(s)). Skipping seed.\n";
}

seedDefaultSiteNavIfEmpty($pdo);

echo "Done.\n";
