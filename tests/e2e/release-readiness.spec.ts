import { expect, test } from '@playwright/test';

const publicRoutes = ['/', '/credits', '/privacy', '/terms', '/contact'];

test('the production build exposes only the approved indexable pages', async ({ page, request }) => {
  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} should be available`).toBe(200);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    await expect(page.locator('body')).not.toContainText(/\bprelaunch\b/i);
  }

  const reviewResponse = await request.get('/content-review');
  expect(reviewResponse.status()).toBe(404);
});

test('missing paths return a useful, non-indexable 404', async ({ page }) => {
  const response = await page.goto('/some-path-that-does-not-exist');

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page Not Found - Undertale Soul Quiz');
  await expect(page.locator('h1')).toHaveText('Page not found');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Return to the homepage' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('link', { name: 'Read llms.txt' })).toHaveAttribute('href', '/llms.txt');
  await expect(page.getByRole('link', { name: 'Open sitemap.xml' })).toHaveAttribute('href', '/sitemap.xml');
});

test('llms.txt follows the project-index format and tells agents when to use the site', async ({ request }) => {
  const response = await request.get('/llms.txt');
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/plain');
  expect(body.startsWith('# Undertale Soul Quiz\n\n> ')).toBe(true);
  expect(body).toContain('## When to use this site');
  expect(body).toContain('To call the experience');
  expect(body).toContain('https://undertalesoulquiz.com/credits');
  expect(body).toContain('https://undertalesoulquiz.com/sitemap.xml');
});
