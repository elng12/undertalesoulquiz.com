import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const supportRoutes = ['/', '/credits', '/privacy', '/terms', '/contact'];

test('the complete quiz works without a pointer and keeps focus in context', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Mobile WebKit does not expose desktop Tab navigation.');
  const runtimeErrors = collectRuntimeErrors(page);
  await page.goto('/');

  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await expectVisibleFocus(page, '.skip-link');
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.locator('#start-quiz')).toBeFocused();
  await expectVisibleFocus(page, '#start-quiz');
  await page.keyboard.press('Enter');
  await expect(page.locator('#question-heading')).toBeFocused();
  await expect(page.locator('#question-heading')).not.toContainText('Synthetic');
  await expect(page.locator('#question-heading')).toContainText('When');

  for (let index = 0; index < 66; index += 1) {
    await page.keyboard.press(String((index % 5) + 1));
  }
  await expect(page.locator('#question-position')).toHaveText('FINAL CHECK 1 / 2');
  await expect(page.locator('#quiz-progress')).toHaveAttribute('aria-label', 'Final check progress');
  await expect(page.locator('#quiz-progress')).toHaveAttribute('aria-valuenow', '1');
  await expect(page.locator('#quiz-progress')).toHaveAttribute('aria-valuemax', '2');
  await page.keyboard.press('1');
  await expect(page.locator('#question-position')).toHaveText('FINAL CHECK 2 / 2');
  await expect(page.locator('#quiz-progress')).toHaveAttribute('aria-valuenow', '2');
  await page.keyboard.press('1');

  await expect(page.locator('#complete-heading')).toBeFocused();
  await expect(page.locator('#result-spread-list > li')).toHaveCount(7);
  await expect(page.locator('#result-share-canvas')).toBeVisible();
  await expect(page.locator('#result-summary')).not.toContainText(/\b(?:synthetic|development|pending)\b/i);
  await expect(page.locator('#result-shadow-copy')).not.toContainText(/\b(?:unavailable|pending)\b/i);
  await expect(page.locator('#result-pairing-copy')).not.toContainText(/\b(?:unavailable|pending)\b/i);
  await expect(page.locator('#result-shadow-copy')).not.toBeEmpty();
  await expect(page.locator('#result-pairing-copy')).not.toBeEmpty();

  await page.locator('#result-home').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#landing-panel')).toBeVisible();
  await expect(page.locator('#start-quiz')).toBeFocused();
  await expect(page.locator('#start-quiz')).toHaveText('VIEW SAVED RESULT');
  await expect(page.locator('#start-new-quiz')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('undertale-soul-quiz:progress:v1'))).not.toBeNull();

  await page.reload();
  await expect(page.locator('#landing-panel')).toBeVisible();
  await expect(page.locator('#complete-panel')).toBeHidden();
  await expect(page.locator('#start-quiz')).toHaveText('VIEW SAVED RESULT');
  await page.locator('#start-quiz').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#complete-heading')).toBeFocused();

  for (let index = 0; index < 4; index += 1) await page.keyboard.press('Tab');
  await expect(page.locator('#complete-back')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#question-heading')).toBeFocused();
  await expect(page.locator('#question-position')).toHaveText('FINAL CHECK 2 / 2');

  await page.keyboard.press('1');
  await expect(page.locator('#complete-heading')).toBeFocused();
  for (let index = 0; index < 5; index += 1) await page.keyboard.press('Tab');
  await expect(page.locator('#retake-quiz')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#retake-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#complete-panel')).toBeVisible();
  await expect(page.locator('#retake-quiz')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#retake-dialog')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('#confirm-retake')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#landing-panel')).toBeVisible();
  await expect(page.locator('#start-quiz')).toBeFocused();
  await expect(page.locator('#start-quiz')).toHaveText('START QUIZ');
  await expect(page.locator('#start-new-quiz')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('undertale-soul-quiz:progress:v1'))).toBeNull();
  expect(runtimeErrors).toEqual([]);
});

test('mobile layouts keep the long-page section navigation available', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('.site-nav')).toBeHidden();
  await expect(page.locator('.mobile-nav > summary')).toBeVisible();
  await page.locator('.mobile-nav > summary').click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Results', exact: true })).toBeVisible();
});

for (const route of supportRoutes) {
  test(`${route} has no automated WCAG A/AA violations`, async ({ page }) => {
    const runtimeErrors = collectRuntimeErrors(page);
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
    expect(runtimeErrors).toEqual([]);
  });
}

async function expectVisibleFocus(page: Page, selector: string): Promise<void> {
  const focus = await page.locator(selector).evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(focus.style).not.toBe('none');
  expect(focus.width).toBeGreaterThanOrEqual(2);
}

function collectRuntimeErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}
