import { expect, test } from '@playwright/test';

const contactEmail = '2296744453m@gmail.com';
const mailto = `mailto:${contactEmail}`;

test('the verified public contact channel is consistent across support pages', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.getByRole('heading', { name: 'Contact', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: contactEmail })).toHaveCount(2);
  await expect(page.getByRole('link', { name: contactEmail }).first()).toHaveAttribute('href', mailto);
  await expect(page.locator('main')).not.toContainText(/not been configured|no email address/i);

  for (const route of ['/credits', '/privacy', '/terms']) {
    await page.goto(route);
    const contactLink = page.getByRole('link', { name: contactEmail });
    await expect(contactLink).toHaveCount(1);
    await expect(contactLink).toHaveAttribute('href', mailto);
  }
});
