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
  expect(description).toBe('Take the Undertale Soul Quiz to find your primary soul and secondary virtue, compare all seven traits, explore your shadow and pairing, and share your result.');
  expect(description?.length).toBeGreaterThanOrEqual(150);
  expect(description?.length).toBeLessThanOrEqual(160);
  expect(words.length).toBeGreaterThanOrEqual(950);
  expect(primaryPhraseCount).toBeGreaterThanOrEqual(4);
  expect(primaryPhraseCount).toBeLessThanOrEqual(7);
  expect(primaryPhraseDensity).toBeLessThan(0.01);
  await expect(page.locator('#method')).toContainText('66 original scored statements');
  await expect(page.locator('#method')).toContainText('not scientifically validated');
  await expect(page.locator('#faq .faq-list details')).toHaveCount(11);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description ?? '');
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', description ?? '');
});

test('the home page exposes accurate WebSite and WebPage structured data', async ({ page }) => {
  await page.goto('/');

  const structuredData = await page.locator('script[type="application/ld+json"]').evaluate((script) => {
    return JSON.parse(script.textContent ?? '{}') as {
      '@context'?: string;
      '@graph'?: Array<Record<string, unknown>>;
    };
  });
  const website = structuredData['@graph']?.find((entry) => entry['@type'] === 'WebSite');
  const webPage = structuredData['@graph']?.find((entry) => entry['@type'] === 'WebPage');

  expect(structuredData['@context']).toBe('https://schema.org');
  expect(website).toMatchObject({
    url: 'https://undertalesoulquiz.com/',
    name: 'Undertale Soul Quiz',
  });
  expect(webPage).toMatchObject({
    url: 'https://undertalesoulquiz.com/',
    name: 'Undertale Soul Quiz: Find Your Primary & Secondary Virtues',
    description: 'Take the Undertale Soul Quiz to find your primary soul and secondary virtue, compare all seven traits, explore your shadow and pairing, and share your result.',
  });
});
