<?php

declare(strict_types=1);

namespace BlogApi\Middleware;

use BlogApi\Services\JwtService;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

final class AuthMiddleware implements MiddlewareInterface
{
    public function __construct(private readonly JwtService $jwt)
    {
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $header = $request->getHeaderLine('Authorization');
        if (!preg_match('/Bearer\s+(.+)/i', $header, $m)) {
            return $this->unauthorized();
        }
        try {
            $claims = $this->jwt->decode(trim($m[1]));
        } catch (\Throwable) {
            return $this->unauthorized();
        }
        if (($claims['role'] ?? '') !== 'admin') {
            return $this->forbidden();
        }
        $request = $request
            ->withAttribute('user_id', $claims['sub'])
            ->withAttribute('user_email', $claims['email']);
        return $handler->handle($request);
    }

    private function unauthorized(): ResponseInterface
    {
        $r = new Response(401);
        $r->getBody()->write(json_encode(['error' => 'Unauthorized'], JSON_THROW_ON_ERROR));
        return $r->withHeader('Content-Type', 'application/json');
    }

    private function forbidden(): ResponseInterface
    {
        $r = new Response(403);
        $r->getBody()->write(json_encode(['error' => 'Forbidden'], JSON_THROW_ON_ERROR));
        return $r->withHeader('Content-Type', 'application/json');
    }
}
