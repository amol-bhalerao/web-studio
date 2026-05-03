<?php

/**
 * Quick API smoke test. Usage:
 *   php api/scripts/smoke-test.php [baseUrl]
 *   php api/scripts/smoke-test.php https://yoursite.com
 *
 * Default base: http://127.0.0.1:8080 (matches `php -S 127.0.0.1:8080 -t api/public`)
 */
declare(strict_types=1);

$base = rtrim($argv[1] ?? 'http://127.0.0.1:8080', '/');

function httpJson(string $method, string $url, ?string $body = null, ?string $bearer = null): array
{
    $ch = curl_init($url);
    $headers = ['Accept: application/json'];
    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
    }
    if ($bearer !== null) {
        $headers[] = 'Authorization: Bearer ' . $bearer;
    }
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => false,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => $headers,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $raw = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($raw === false) {
        return ['code' => 0, 'data' => null, 'error' => $err ?: 'curl failed'];
    }
    $data = json_decode($raw, true);
    return ['code' => $code, 'data' => $data, 'raw' => $raw];
}

$fail = 0;

function step(string $name, bool $ok, string $detail = ''): void
{
    global $fail;
    if (!$ok) {
        $fail++;
    }
    $s = $ok ? 'OK' : 'FAIL';
    fwrite(STDERR, sprintf("[%s] %s %s\n", $s, $name, $detail ? "- $detail" : ''));
}

// 1) Health
$r = httpJson('GET', $base . '/api/v1/health');
step('GET /api/v1/health', $r['code'] === 200 && (($r['data']['status'] ?? '') === 'ok'), 'code=' . $r['code']);

// 2) Public posts
$r = httpJson('GET', $base . '/api/v1/posts?page=1&per_page=2');
step('GET /api/v1/posts', $r['code'] === 200 && isset($r['data']['data']), 'code=' . $r['code']);

// 3) Home payload
$r = httpJson('GET', $base . '/api/v1/home');
step('GET /api/v1/home', $r['code'] === 200 && isset($r['data']['hero']), 'code=' . $r['code']);

// 4) Login
$loginBody = json_encode(['email' => 'admin@example.com', 'password' => 'ChangeMe!Admin1'], JSON_THROW_ON_ERROR);
$r = httpJson('POST', $base . '/api/v1/auth/login', $loginBody);
$token = is_array($r['data']) ? ($r['data']['token'] ?? null) : null;
step(
    'POST /api/v1/auth/login',
    $r['code'] === 200 && is_string($token) && $token !== '',
    'code=' . $r['code'] . (isset($r['data']['error']) ? ' ' . (string) $r['data']['error'] : '')
);

// 5) Admin stats
if (is_string($token) && $token !== '') {
    $r = httpJson('GET', $base . '/api/v1/admin/stats', null, $token);
    step('GET /api/v1/admin/stats', $r['code'] === 200 && isset($r['data']['posts_total']), 'code=' . $r['code']);
} else {
    step('GET /api/v1/admin/stats', false, 'skipped (no token)');
}

exit($fail > 0 ? 1 : 0);
