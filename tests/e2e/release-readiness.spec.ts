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
