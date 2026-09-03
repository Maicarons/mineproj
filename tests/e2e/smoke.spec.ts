import { expect, test } from '@playwright/test';

const PROJECT_NAMES = ['Voxel Tool', 'Pixel Pong', 'CSV Wrangler', 'Atlas Maps', 'Ink Scheduler'];

test('homepage renders the site title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Basic Example');
  await expect(page.locator('h1')).toHaveText('Basic Example');
});

test('homepage lists all five example projects as cards', async ({ page }) => {
  await page.goto('/');
  const grid = page.locator('section[aria-label="All projects"]');
  for (const name of PROJECT_NAMES) {
    await expect(grid.locator('.mp-card').filter({ hasText: name })).toHaveCount(1);
  }
  expect(await grid.locator('.mp-card').count()).toBe(5);
});

test('tokens, skip link and theme toggle are present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mp-skip-link')).toHaveCount(1);
  await expect(page.locator('[data-mp-island="theme-toggle"]')).toHaveCount(1);
});
