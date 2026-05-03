<?php

declare(strict_types=1);

namespace BlogApi\Controllers;

use BlogApi\Database;
use PDO;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final class SiteChromeController
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
        $body = json_decode((string) $request->getBody(), true) ?? [];
        if (!isset($body['header']) || !isset($body['footer'])) {
            return $this->json($response, ['error' => 'header and footer objects required'], 422);
        }
        if (!is_array($body['header']) || !is_array($body['footer'])) {
            return $this->json($response, ['error' => 'header and footer must be objects'], 422);
        }
        $headerJson = json_encode($body['header'], JSON_THROW_ON_ERROR);
        $footerJson = json_encode($body['footer'], JSON_THROW_ON_ERROR);

        $pdo = $this->db->pdo();
        $st = $pdo->prepare(
            'INSERT INTO site_chrome (id, header_json, footer_json) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE header_json = VALUES(header_json), footer_json = VALUES(footer_json)'
        );
        $st->execute([self::ROW_ID, $headerJson, $footerJson]);

        $payload = $this->loadOrDefaults();
        $response->getBody()->write(json_encode($payload, JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /** @return array{header: array, footer: array} */
    private function loadOrDefaults(): array
    {
        $pdo = $this->db->pdo();
        $st = $pdo->prepare('SELECT header_json, footer_json FROM site_chrome WHERE id = ?');
        $st->execute([self::ROW_ID]);
        $row = $st->fetch(PDO::FETCH_ASSOC);
        $header = $this->decodeMerge($row['header_json'] ?? null, $this->defaultHeader());
        $footer = $this->decodeMerge($row['footer_json'] ?? null, $this->defaultFooter());
        return ['header' => $header, 'footer' => $footer];
    }

    /** @param mixed $raw */
    private function decodeMerge(?string $raw, array $defaults): array
    {
        if ($raw === null || $raw === '') {
            return $defaults;
        }
        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
            if (!is_array($decoded)) {
                return $defaults;
            }
            /** @psalm-suppress MixedArgumentTypeCoercion */
            return array_replace_recursive($defaults, $decoded);
        } catch (\JsonException) {
            return $defaults;
        }
    }

    /** @return array<string, mixed> */
    private function defaultHeader(): array
    {
        return [
            'minHeightPx' => null,
            'maxHeightPx' => null,
            'leftLogos' => [],
            'center' => [
                'mode' => 'text',
                'imageUrl' => null,
                'imageMaxHeightPx' => 96,
                'lines' => [],
            ],
            'rightLogos' => [],
        ];
    }

    /** @return array<string, mixed> */
    private function defaultFooter(): array
    {
        return [
            'mode' => 'text',
            'imageUrl' => null,
            'imageMaxHeightPx' => 48,
            'lines' => [],
        ];
    }

    private function json(ResponseInterface $response, array $payload, int $status = 400): ResponseInterface
    {
        $response->getBody()->write(json_encode($payload, JSON_THROW_ON_ERROR));
        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    }
}
