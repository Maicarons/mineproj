import { expect, test } from '@playwright/test';

const PROJECT_NAMES = [
  'Voxel Tool',
  'Pixel Pong',
  'CSV Wrangler',
  'Atlas Maps',
  'Ink Scheduler',
];

test('homepage renders the site title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Basic Example');
  await expect(page.locator('h1')).toHaveText('Basic Example');
});

test('homepage lists all five example projects', async ({ page }) => {
  await page.goto('/');
  for (const name of PROJECT_NAMES) {
    await expect(page.locator('ul li').filter({ hasText: name })).toHaveCount(1);
  }
  expect(await page.locator('ul li').count()).toBe(5);
});
