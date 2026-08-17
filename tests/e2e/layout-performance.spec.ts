import { expect, test, type Page } from '@playwright/test';

test('the desktop content grids stay balanced without inventing an eighth virtue', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'The four- and two-column balance is desktop-specific.');
  await page.goto('/');

  await expect(page.locator('#souls [data-virtue]')).toHaveCount(7);
  await expect(page.locator('#souls .soul-overview-item')).toHaveCount(1);
  await expect(page.locator('#results .result-points article')).toHaveCount(6);

  const layout = await page.evaluate(() => {
    const rowCounts = (selector: string) => {
      const rows = new Map<number, number>();
      for (const element of document.querySelectorAll<HTMLElement>(selector)) {
        const top = Math.round(element.getBoundingClientRect().top);
        rows.set(top, (rows.get(top) ?? 0) + 1);
      }
      return [...rows.values()];
    };
    const centered = (selector: string, containerSelector: string) => {
      const container = document.querySelector<HTMLElement>(containerSelector);
      if (!container) return false;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      return [...document.querySelectorAll<HTMLElement>(selector)].every((element) => {
        const elementRect = element.getBoundingClientRect();
        const elementCenter = elementRect.left + elementRect.width / 2;
        return getComputedStyle(element).textAlign === 'center'
          && Math.abs(elementCenter - containerCenter) <= 1;
      });
    };

    return {
      soulRows: rowCounts('#souls .soul-grid > article'),
      resultRows: rowCounts('#results .result-points > article'),
      soulHeadingCentered: centered(
        '#souls > .content-inner > .section-kicker, #souls-heading, #souls .section-intro',
        '#souls > .content-inner',
      ),
      methodCopyCentered: centered(
        '#method > .content-inner > p, #method-heading',
        '#method > .content-inner',
      ),
      resultHeadingCentered: centered('#results .result-intro > *', '#results > .content-inner'),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  expect(layout.soulRows).toEqual([4, 4]);
  expect(layout.resultRows).toEqual([2, 2, 2]);
  expect(layout.soulHeadingCentered).toBe(true);
  expect(layout.methodCopyCentered).toBe(true);
  expect(layout.resultHeadingCentered).toBe(true);
  expect(layout.horizontalOverflow).toBe(false);
});

test('the completed result reflows at a 200 percent effective viewport without overlap', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 450 });
  await page.goto('/');
  await page.locator('#start-quiz').click();

  for (let index = 0; index < 66; index += 1) {
    await page.keyboard.press(String((index % 5) + 1));
  }
  await page.keyboard.press('1');
  await page.keyboard.press('1');
  await expect(page.locator('#complete-panel')).toBeVisible();

  const layout = await page.evaluate(() => {
    const text = document.querySelector<HTMLElement>('.result-share-tools > div');
    const canvas = document.querySelector<HTMLCanvasElement>('#result-share-canvas');
    const count = document.querySelector<HTMLElement>('#completion-count');
    if (!text || !canvas || !count) throw new Error('Result layout element missing.');
    const textRect = text.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const countRect = count.getBoundingClientRect();
    const overlaps = (first: DOMRect, second: DOMRect) => !(
      first.right <= second.left
      || second.right <= first.left
      || first.bottom <= second.top
      || second.bottom <= first.top
    );
    const context = canvas.getContext('2d');
    const centerPixel = context?.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
    return {
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      textCanvasOverlap: overlaps(textRect, canvasRect),
      canvasCountOverlap: overlaps(canvasRect, countRect),
      canvasWidth: canvasRect.width,
      canvasPixelAlpha: centerPixel?.[3] ?? 0,
    };
  });

  expect(layout.horizontalOverflow).toBe(false);
  expect(layout.textCanvasOverlap).toBe(false);
  expect(layout.canvasCountOverlap).toBe(false);
  expect(layout.canvasWidth).toBeGreaterThan(0);
  expect(layout.canvasWidth).toBeLessThanOrEqual(640);
  expect(layout.canvasPixelAlpha).toBeGreaterThan(0);
});

test('the home page stays inside the local runtime performance budget', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Chromium supplies consistent navigation timing.');
  await installLayoutShiftObserver(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return {
      loadMs: navigation.loadEventEnd,
      transferredBytes: resources.reduce((sum, entry) => sum + entry.transferSize, 0),
      layoutShift: (window as Window & { __quizCls?: number }).__quizCls ?? 0,
    };
  });

  expect(metrics.loadMs).toBeLessThan(5_000);
  expect(metrics.transferredBytes).toBeLessThanOrEqual(120 * 1024);
  expect(metrics.layoutShift).toBeLessThanOrEqual(0.1);
});

async function installLayoutShiftObserver(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const state = window as Window & { __quizCls?: number };
    state.__quizCls = 0;
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) state.__quizCls = (state.__quizCls ?? 0) + (shift.value ?? 0);
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch {
      state.__quizCls = 0;
    }
  });
}
