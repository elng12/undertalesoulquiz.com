import { expect, test } from '@playwright/test';

const routes = ['/', '/credits', '/privacy', '/terms', '/contact'];
const imageUrl = 'https://undertalesoulquiz.com/og-undertale-soul-quiz.jpg';

test('public pages expose the large social preview image', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', imageUrl);
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute('content', 'image/jpeg');
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', imageUrl);
  }

  const dimensions = await page.evaluate((source) => new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('Social preview image failed to load.'));
    image.src = source;
  }), '/og-undertale-soul-quiz.jpg');

  expect(dimensions).toEqual({ width: 1200, height: 630 });
});

test('the home page keeps its approved SEO copy depth and metadata', async ({ page }) => {
  await page.goto('/');

  const title = await page.title();
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  const bodyText = await page.locator('body').evaluate((body) => {
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const textNodes: string[] = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode.textContent ?? '');
    return textNodes.join(' ');
  });
  const words = bodyText.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g) ?? [];
  const primaryPhraseCount = bodyText.toLowerCase().match(/\bundertale\s+soul\s+quiz\b/g)?.length ?? 0;
  const primaryPhraseDensity = primaryPhraseCount / words.length;

  expect(title.length).toBeGreaterThanOrEqual(55);
  expect(title.length).toBeLessThanOrEqual(60);
  expect(description?.length).toBeGreaterThanOrEqual(150);
  expect(description?.length).toBeLessThanOrEqual(160);
  expect(words.length).toBeGreaterThanOrEqual(800);
  expect(primaryPhraseCount).toBeGreaterThanOrEqual(10);
  expect(primaryPhraseDensity).toBeGreaterThanOrEqual(0.01);
  expect(primaryPhraseDensity).toBeLessThanOrEqual(0.015);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description ?? '');
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', description ?? '');
});
