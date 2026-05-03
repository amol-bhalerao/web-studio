<?php

declare(strict_types=1);

namespace BlogApi\Controllers;

use BlogApi\Database;
use BlogApi\Services\JwtService;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final class AuthController
{
    public function __construct(
        private readonly Database $db,
        private readonly JwtService $jwt
    ) {
    }

    public function login(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $body = json_decode((string) $request->getBody(), true);
        $email = trim((string) ($body['email'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        if ($email === '' || $password === '') {
            return $this->json($response, ['error' => 'Email and password required'], 422);
        }

        $pdo = $this->db->pdo();
        $st = $pdo->prepare('SELECT id, email, password_hash, role, display_name FROM users WHERE email = ? LIMIT 1');
        $st->execute([$email]);
        $user = $st->fetch();
        if (!$user || !password_verify($password, (string) $user['password_hash'])) {
            return $this->json($response, ['error' => 'Invalid credentials'], 401);
        }
        if (($user['role'] ?? '') !== 'admin') {
            return $this->json($response, ['error' => 'Forbidden'], 403);
        }

        $token = $this->jwt->issue((int) $user['id'], (string) $user['email'], 'admin');
        return $this->json($response, [
            'token' => $token,
            'user' => [
                'id' => (int) $user['id'],
                'email' => (string) $user['email'],
                'role' => (string) $user['role'],
                'display_name' => isset($user['display_name']) && $user['display_name'] !== null && $user['display_name'] !== ''
                    ? (string) $user['display_name']
                    : null,
            ],
        ]);
    }

    private function json(ResponseInterface $response, array $data, int $status = 200): ResponseInterface
    {
        $response->getBody()->write(json_encode($data, JSON_THROW_ON_ERROR));
        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    }
}
