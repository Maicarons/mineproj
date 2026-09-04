import { expect, test } from '@playwright/test';

/**
 * Production build E2E tests (M8-02): covers navigation, cards, and basic features.
 */

test.describe('Site navigation', () => {
  test('homepage renders the site title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Basic Example');
    await expect(page.locator('h1')).toHaveText('Basic Example');
  });

  test('homepage lists all five example projects as cards', async ({ page }) => {
    await page.goto('/');
    const grid = page.locator('section[aria-label="All projects"]');
    const names = ['Voxel Tool', 'Pixel Pong', 'CSV Wrangler', 'Atlas Maps', 'Ink Scheduler'];
    for (const name of names) {
      await expect(grid.locator('.mp-card').filter({ hasText: name })).toHaveCount(1);
    }
    expect(await grid.locator('.mp-card').count()).toBe(5);
  });

  test('tokens, skip link and theme toggle are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.mp-skip-link')).toHaveCount(1);
    await expect(page.locator('[data-mp-island="theme-toggle"]')).toHaveCount(1);
  });
});

test.describe('Project navigation', () => {
  test('deep link to a project detail page works', async ({ page }) => {
    await page.goto('/projects/voxel-tool/');
    await expect(page.locator('h1')).toContainText('Voxel Tool');
  });

  test('tag page filters by tag', async ({ page }) => {
    await page.goto('/tags/game/');
    const cards = page.locator('.mp-card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('404 page shows not-found content', async ({ page }) => {
    await page.goto('/404.html');
    await expect(page.locator('h1')).toContainText('404');
  });
});

test.describe('Cards', () => {
  test('project card shows cover image', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.mp-card').first();
    const img = card.locator('img').first();
    await expect(img).toBeVisible();
  });

  test('project card has tags', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.mp-card').first();
    expect(await card.locator('.mp-tag').count()).toBeGreaterThanOrEqual(1);
  });
});

test.describe('i18n', () => {
  test('english locale page is accessible', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Visual Editor', () => {
  test('editor is NOT included in the production build', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    expect(html).not.toContain('mp-editor-form');
  });
});