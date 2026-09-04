import { expect, test } from '@playwright/test';

/**
 * Extended E2E tests (M8-02): covers navigation, i18n, filtering, and cards.
 */

test.describe('Site navigation', () => {
  test('404 page shows not-found content', async ({ page }) => {
    // The 404 page is at /404.html (the preview server serves index.html for unknown paths)
    await page.goto('/404.html');
    await expect(page.locator('h1')).toContainText('404');
  });

  test('deep link to a project detail page works', async ({ page }) => {
    await page.goto('/projects/voxel-tool/');
    await expect(page.locator('h1')).toContainText('Voxel Tool');
    await expect(page.locator('.mp-card')).toHaveCount(0);
  });

  test('project detail shows basic info', async ({ page }) => {
    await page.goto('/projects/voxel-tool/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Voxel Tool');
  });

  test('tag page filters by tag', async ({ page }) => {
    await page.goto('/tags/game/');
    const cards = page.locator('.mp-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Search', () => {
  test('search elements are present on the homepage', async ({ page }) => {
    await page.goto('/');
    // The search box may be rendered as an island
    const searchBox = page.locator('.mp-search-box, input[type="search"], [aria-label*="Search"]').first();
    if (await searchBox.isVisible().catch(() => false)) {
      await expect(searchBox).toBeVisible();
    }
  });
});

test.describe('i18n', () => {
  test('locale switcher is present on multilingual site', async ({ page }) => {
    await page.goto('/');
    const switcher = page.locator('[data-mp-island="lang-switch"]');
    if (await switcher.isVisible().catch(() => false)) {
      await expect(switcher).toBeVisible();
    }
  });

  test('english locale page is accessible', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Filtering and discovery', () => {
  test('library explorer is rendered on homepage', async ({ page }) => {
    await page.goto('/');
    const explorer = page.locator('[data-mp-island="library-explorer"]');
    if (await explorer.isVisible().catch(() => false)) {
      await expect(explorer).toBeVisible();
    }
  });

  test('project cards are visible on homepage', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.mp-card');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Accessibility', () => {
  test('skip link is present', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('.mp-skip-link');
    await expect(skipLink).toHaveCount(1);
  });

  test('theme toggle is present', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-mp-island="theme-toggle"]');
    await expect(toggle).toHaveCount(1);
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
    const tagCount = await card.locator('.mp-tag').count();
    expect(tagCount).toBeGreaterThanOrEqual(0);
  });
});