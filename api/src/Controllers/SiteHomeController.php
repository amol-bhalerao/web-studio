<?php

declare(strict_types=1);

namespace BlogApi\Controllers;

use BlogApi\Database;
use PDO;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final class SiteHomeController
{
    private const ROW_ID = 1;

    public function __construct(private readonly Database $db)
    {
    }

    public function getPublic(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $payload = $this->loadOrDefaults();
        $response->getBody()->write(json_encode($payload, JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getAdmin(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $payload = $this->loadOrDefaults();
        $response->getBody()->write(json_encode($payload, JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function updateAdmin(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $body = json_decode((string) $request->getBody(), true);
        if (!is_array($body)) {
            return $this->json($response, ['error' => 'Invalid JSON body'], 422);
        }
        $merged = $this->normalizePayload($body);
        $json = json_encode($merged, JSON_THROW_ON_ERROR);

        $pdo = $this->db->pdo();
        $st = $pdo->prepare(
            'INSERT INTO site_home (id, content_json) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE content_json = VALUES(content_json)'
        );
        $st->execute([self::ROW_ID, $json]);

        $payload = $this->loadOrDefaults();
        $response->getBody()->write(json_encode($payload, JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /** @return array<string, mixed> */
    private function loadOrDefaults(): array
    {
        $pdo = $this->db->pdo();
        $st = $pdo->prepare('SELECT content_json FROM site_home WHERE id = ?');
        $st->execute([self::ROW_ID]);
        $row = $st->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return $this->defaultContent();
        }
        $raw = $row['content_json'] ?? null;
        if ($raw === null || $raw === '') {
            return $this->defaultContent();
        }
        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
            if (!is_array($decoded)) {
                return $this->defaultContent();
            }
            return $this->normalizePayload($decoded);
        } catch (\JsonException) {
            return $this->defaultContent();
        }
    }

    /** @param array<string, mixed> $in */
    private function normalizePayload(array $in): array
    {
        $d = $this->defaultContent();

        if (isset($in['hero']) && is_array($in['hero'])) {
            $h = $in['hero'];
            $d['hero']['title'] = trim((string) ($h['title'] ?? $d['hero']['title']));
            $d['hero']['subtitle'] = trim((string) ($h['subtitle'] ?? $d['hero']['subtitle']));
            $d['hero']['tagline'] = trim((string) ($h['tagline'] ?? $d['hero']['tagline']));
            $d['hero']['image_url'] = trim((string) ($h['image_url'] ?? $d['hero']['image_url']));
            $d['hero']['primary_cta_label'] = trim((string) ($h['primary_cta_label'] ?? $d['hero']['primary_cta_label']));
            $d['hero']['primary_cta_href'] = trim((string) ($h['primary_cta_href'] ?? $d['hero']['primary_cta_href']));
            $d['hero']['secondary_cta_label'] = trim((string) ($h['secondary_cta_label'] ?? $d['hero']['secondary_cta_label']));
            $d['hero']['secondary_cta_href'] = trim((string) ($h['secondary_cta_href'] ?? $d['hero']['secondary_cta_href']));
            if (isset($h['stats']) && is_array($h['stats'])) {
                $stats = [];
                foreach ($h['stats'] as $row) {
                    if (!is_array($row)) {
                        continue;
                    }
                    $stats[] = [
                        'label' => trim((string) ($row['label'] ?? '')),
                        'value' => trim((string) ($row['value'] ?? '')),
                    ];
                }
                $d['hero']['stats'] = $stats;
            }
        }

        if (isset($in['sections']) && is_array($in['sections'])) {
            $sections = [];
            foreach ($in['sections'] as $s) {
                if (!is_array($s)) {
                    continue;
                }
                $id = trim((string) ($s['id'] ?? ''));
                if ($id === '') {
                    $id = bin2hex(random_bytes(6));
                }
                $var = (string) ($s['variant'] ?? 'default');
                if (!in_array($var, ['default', 'muted', 'accent'], true)) {
                    $var = 'default';
                }
                $sections[] = [
                    'id' => $id,
                    'heading' => trim((string) ($s['heading'] ?? '')),
                    'subheading' => trim((string) ($s['subheading'] ?? '')),
                    'body_html' => (string) ($s['body_html'] ?? ''),
                    'variant' => $var,
                ];
            }
            $d['sections'] = $sections;
        }

        if (array_key_exists('show_latest_posts', $in)) {
            $d['show_latest_posts'] = (bool) $in['show_latest_posts'];
        }
        if (isset($in['latest_posts_heading'])) {
            $d['latest_posts_heading'] = trim((string) $in['latest_posts_heading']);
        }
        if (isset($in['latest_posts_intro'])) {
            $d['latest_posts_intro'] = trim((string) $in['latest_posts_intro']);
        }

        return $d;
    }

    /** @return array<string, mixed> */
    private function defaultContent(): array
    {
        return [
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
                    'body_html' => '<p>Describe what you offer—courses, consulting, programs, or seasonal campaigns. Replace this copy with content that fits your business or nonprofit.</p>',
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
    }

    private function json(ResponseInterface $response, array $payload, int $status = 400): ResponseInterface
    {
        $response->getBody()->write(json_encode($payload, JSON_THROW_ON_ERROR));
        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    }
}
