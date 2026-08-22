import { describe, expect, it } from 'vitest';
import {
  HTML_MEDIA_TYPE,
  MARKDOWN_MEDIA_TYPE,
  NOT_FOUND_MARKDOWN,
  PAGE_MARKDOWN,
  isAgentPagePath,
  negotiateMediaType,
  normalizePagePath,
} from '../../src/agent/content';

describe('agent content negotiation', () => {
  it.each([
    [null, HTML_MEDIA_TYPE],
    ['', HTML_MEDIA_TYPE],
    ['*/*', HTML_MEDIA_TYPE],
    ['text/html', HTML_MEDIA_TYPE],
    ['text/markdown', MARKDOWN_MEDIA_TYPE],
    ['text/markdown, text/html;q=0.8', MARKDOWN_MEDIA_TYPE],
    ['text/html, text/markdown;q=0.8', HTML_MEDIA_TYPE],
    ['text/markdown;q=0, text/html', HTML_MEDIA_TYPE],
    ['text/html;q=0, */*;q=1', MARKDOWN_MEDIA_TYPE],
    ['application/pdf', null],
    ['text/html;q=0, text/markdown;q=0', null],
  ])('selects the correct representation for %j', (accept, expected) => {
    expect(negotiateMediaType(accept)).toBe(expected);
  });

  it('breaks equal-quality matches in client order', () => {
    expect(negotiateMediaType('text/markdown, text/html')).toBe(MARKDOWN_MEDIA_TYPE);
    expect(negotiateMediaType('text/html, text/markdown')).toBe(HTML_MEDIA_TYPE);
  });

  it('maps canonical and trailing-slash public paths to markdown', () => {
    expect(normalizePagePath('/contact/')).toBe('/contact');
    expect(isAgentPagePath(normalizePagePath('/contact/'))).toBe(true);
    expect(PAGE_MARKDOWN['/contact']).toContain('# Contact - Undertale Soul Quiz');
    expect(PAGE_MARKDOWN['/']).toContain('## Start the quiz');
  });

  it('gives missing paths a concise recovery map', () => {
    expect(NOT_FOUND_MARKDOWN).toContain('# 404 - Page not found');
    expect(NOT_FOUND_MARKDOWN).toContain('https://undertalesoulquiz.com/llms.txt');
    expect(NOT_FOUND_MARKDOWN).toContain('https://undertalesoulquiz.com/sitemap.xml');
  });
});
