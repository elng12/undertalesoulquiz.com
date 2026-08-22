import { describe, expect, it } from 'vitest';
import middleware from '../../middleware';

function request(path: string, accept: string, method = 'GET'): Request {
  return new Request(`https://undertalesoulquiz.com${path}`, {
    method,
    headers: { Accept: accept },
  });
}

describe('Vercel agent-readiness middleware', () => {
  it('serves canonical pages as Markdown with cache-safe headers', async () => {
    const response = middleware(request('/credits', 'text/markdown, text/html;q=0.8'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('Vary')).toBe('Accept, Accept-Encoding');
    expect(await response.text()).toContain('# Credits - Undertale Soul Quiz');
  });

  it('continues to the static HTML page while adding Vary', () => {
    const response = middleware(request('/', 'text/html'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('Vary')).toBe('Accept, Accept-Encoding');
  });

  it('returns 406 when neither available representation is acceptable', async () => {
    const response = middleware(request('/', 'application/pdf'));

    expect(response.status).toBe(406);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(response.headers.get('Vary')).toBe('Accept, Accept-Encoding');
    expect(await response.text()).toContain('Available: text/html, text/markdown');
  });

  it('returns a Markdown 404 at the originally requested path', async () => {
    const response = middleware(request('/missing-agent-page', 'text/markdown'));

    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(await response.text()).toContain('# 404 - Page not found');
  });

  it('leaves machine-readable files and static assets on their native routes', () => {
    for (const path of ['/llms.txt', '/sitemap.xml', '/_astro/app.js']) {
      const response = middleware(request(path, '*/*'));
      expect(response.headers.get('x-middleware-next'), path).toBe('1');
      expect(response.headers.get('Vary'), path).toBeNull();
    }
  });
});
