import { next } from '@vercel/functions';
import {
  MARKDOWN_MEDIA_TYPE,
  NOT_FOUND_MARKDOWN,
  PAGE_MARKDOWN,
  isAgentPagePath,
  negotiateMediaType,
  normalizePagePath,
} from './src/agent/content.js';

const VARY = 'Accept, Accept-Encoding';
const PASSTHROUGH_PREFIXES = ['/_astro/', '/.well-known/'];
const PASSTHROUGH_FILES = new Set([
  '/BingSiteAuth.xml',
  '/favicon.svg',
  '/llms.txt',
  '/og-undertale-soul-quiz.jpg',
  '/robots.txt',
  '/sitemap.xml',
]);

export const config = {
  matcher: '/:path*',
};

export default function middleware(request: Request): Response {
  const { pathname } = new URL(request.url);
  if (
    !['GET', 'HEAD'].includes(request.method)
    || PASSTHROUGH_FILES.has(pathname)
    || PASSTHROUGH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    || /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return next();
  }

  const normalizedPath = normalizePagePath(pathname);
  const negotiated = negotiateMediaType(request.headers.get('accept'));

  if (negotiated === null) {
    return new Response('Not Acceptable\n\nAvailable: text/html, text/markdown\n', {
      status: 406,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        Vary: VARY,
      },
    });
  }

  if (negotiated === MARKDOWN_MEDIA_TYPE) {
    const found = isAgentPagePath(normalizedPath);
    const body = found ? PAGE_MARKDOWN[normalizedPath] : NOT_FOUND_MARKDOWN;
    return new Response(body, {
      status: found ? 200 : 404,
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Content-Language': 'en',
        'Content-Type': `${MARKDOWN_MEDIA_TYPE}; charset=utf-8`,
        Vary: VARY,
      },
    });
  }

  return next({
    headers: {
      Vary: VARY,
    },
  });
}
