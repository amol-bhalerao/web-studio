<?php

declare(strict_types=1);

namespace BlogApi\Controllers;

use BlogApi\Database;
use BlogApi\Util\CategorySubtree;
use BlogApi\Util\Slug;
use PDO;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final class CategoryController
{
    public function __construct(private readonly Database $db)
    {
    }

    public function listPublic(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $pdo = $this->db->pdo();
        $st = $pdo->query(
            'SELECT c.id, c.parent_id, c.name, c.slug FROM categories c ORDER BY c.name'
        );
        $rows = $st->fetchAll();
        $map = CategorySubtree::childrenMap($pdo);
        foreach ($rows as &$r) {
            $r['id'] = (int) $r['id'];
            $r['parent_id'] = $r['parent_id'] !== null ? (int) $r['parent_id'] : null;
            $sub = CategorySubtree::subtreeIdsFromRoot($r['id'], $map);
            $r['post_count'] = CategorySubtree::countPublishedPostsInCategories($pdo, $sub);
        }
        unset($r);
        $response->getBody()->write(json_encode(['data' => $rows], JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function listAdmin(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $pdo = $this->db->pdo();
        $st = $pdo->query(
            'SELECT c.id, c.parent_id, c.name, c.slug, c.created_at FROM categories c ORDER BY c.name'
        );
        $rows = $st->fetchAll();
        $map = CategorySubtree::childrenMap($pdo);
        foreach ($rows as &$r) {
            $r['id'] = (int) $r['id'];
            $r['parent_id'] = $r['parent_id'] !== null ? (int) $r['parent_id'] : null;
            $sub = CategorySubtree::subtreeIdsFromRoot($r['id'], $map);
            $r['post_count'] = CategorySubtree::countPostsInCategories($pdo, $sub);
        }
        unset($r);
        $response->getBody()->write(json_encode(['data' => $rows], JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $body = json_decode((string) $request->getBody(), true) ?? [];
        $name = trim((string) ($body['name'] ?? ''));
        if ($name === '') {
            return $this->json($response, ['error' => 'Name is required'], 422);
        }
        $pdo = $this->db->pdo();
        $parentId = $this->normalizeParentId($body['parent_id'] ?? null);
        if ($parentId !== null && !$this->categoryExists($pdo, $parentId)) {
            return $this->json($response, ['error' => 'Parent category not found'], 422);
        }
        $base = Slug::fromTitle($name);
        $slug = Slug::unique($pdo, $base, 'categories');
        $st = $pdo->prepare('INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)');
        $st->execute([$name, $slug, $parentId]);
        $id = (int) $pdo->lastInsertId();
        $st = $pdo->prepare('SELECT * FROM categories WHERE id = ?');
        $st->execute([$id]);
        $row = $st->fetch();
        $row['id'] = $id;
        $response->getBody()->write(json_encode($row, JSON_THROW_ON_ERROR));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $id = (int) ($args['id'] ?? 0);
        $body = json_decode((string) $request->getBody(), true) ?? [];
        $pdo = $this->db->pdo();
        $st = $pdo->prepare('SELECT id FROM categories WHERE id = ?');
        $st->execute([$id]);
        if (!$st->fetch()) {
            return $this->json($response, ['error' => 'Not found'], 404);
        }

        $fields = [];
        $bind = [];
        if (array_key_exists('name', $body)) {
            $fields[] = 'name = ?';
            $bind[] = trim((string) $body['name']);
        }
        if (array_key_exists('slug', $body)) {
            $slugRaw = trim((string) $body['slug']);
            if ($slugRaw !== '') {
                $base = Slug::fromTitle($slugRaw);
                $bind[] = Slug::unique($pdo, $base, 'categories', $id);
                $fields[] = 'slug = ?';
            }
        }
        if (array_key_exists('parent_id', $body)) {
            $parentId = $this->normalizeParentId($body['parent_id']);
            if ($parentId !== null) {
                if (!$this->categoryExists($pdo, $parentId)) {
                    return $this->json($response, ['error' => 'Parent category not found'], 422);
                }
                if ($this->parentWouldCycle($pdo, $id, $parentId)) {
                    return $this->json($response, ['error' => 'Invalid parent (would create a cycle)'], 422);
                }
            }
            $fields[] = 'parent_id = ?';
            $bind[] = $parentId;
        }
        if ($fields !== []) {
            $bind[] = $id;
            $sql = 'UPDATE categories SET ' . implode(', ', $fields) . ' WHERE id = ?';
            $pdo->prepare($sql)->execute($bind);
        }

        $st = $pdo->prepare('SELECT * FROM categories WHERE id = ?');
        $st->execute([$id]);
        $row = $st->fetch();
        $row['id'] = $id;
        $response->getBody()->write(json_encode($row, JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function delete(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $id = (int) ($args['id'] ?? 0);
        $pdo = $this->db->pdo();
        $pdo->prepare('DELETE FROM post_categories WHERE category_id = ?')->execute([$id]);
        $st = $pdo->prepare('DELETE FROM categories WHERE id = ?');
        $st->execute([$id]);
        if ($st->rowCount() === 0) {
            return $this->json($response, ['error' => 'Not found'], 404);
        }
        return $response->withStatus(204);
    }

    private function json(ResponseInterface $response, array $data, int $status = 200): ResponseInterface
    {
        $response->getBody()->write(json_encode($data, JSON_THROW_ON_ERROR));
        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    }

    private function normalizeParentId(mixed $raw): ?int
    {
        if ($raw === null || $raw === '') {
            return null;
        }
        $id = (int) $raw;
        return $id > 0 ? $id : null;
    }

    private function categoryExists(PDO $pdo, int $id): bool
    {
        $st = $pdo->prepare('SELECT 1 FROM categories WHERE id = ?');
        $st->execute([$id]);
        return (bool) $st->fetchColumn();
    }

    /** True if assigning parentId to category id would create a cycle. */
    private function parentWouldCycle(PDO $pdo, int $id, int $parentId): bool
    {
        if ($parentId === $id) {
            return true;
        }
        $map = CategorySubtree::childrenMap($pdo);
        $sub = CategorySubtree::subtreeIdsFromRoot($id, $map);
        return \in_array($parentId, $sub, true);
    }
}
