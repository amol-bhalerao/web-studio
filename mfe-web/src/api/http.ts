/** Parse API bodies; avoid JSON.parse on HTML error pages (Unexpected token '<'). */
export async function parseApiJson<T>(res: Response, rawText: string): Promise<T | null> {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const looksHtml =
    trimmed.startsWith('<!') ||
    trimmed.startsWith('<html') ||
    ct.includes('text/html');

  if (looksHtml) {
    const hint =
      res.status === 404
        ? 'Nothing found at this URL — the API may be wrong or the dev proxy is missing.'
        : 'The server returned HTML instead of JSON. Check that the API is running, CORS/proxy is set, and VITE_API_BASE points to /api/v1 in dev.';
    throw new Error(hint);
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(
      `Invalid JSON response (${res.status}). First bytes: ${trimmed.slice(0, 120)}${trimmed.length > 120 ? '…' : ''}`
    );
  }
}

export function errorMessageFromBody(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const o = data as Record<string, unknown>;
  if (typeof o.error === 'string') return o.error;
  if (typeof o.message === 'string') return o.message;
  return undefined;
}
