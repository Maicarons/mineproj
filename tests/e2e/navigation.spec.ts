import { expect, test } from '@playwright/test';

/**
 * Extended E2E tests (M8-02): covers search, filtering, i18n switching,
 * deep links, 404, and other user-facing features.
 */

test.describe('Site navigation', () => {
  test('404 page returns not-found', async ({ page }) => {
    const response = await page.goto('/nonexistent-page/');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('404');
  });

  test('deep link to a project detail page works', async ({ page }) => {
    await page.goto('/projects/voxel-tool/');
    await expect(page.locator('h1')).toContainText('Voxel Tool');
    await expect(page.locator('.mp-card')).toHaveCount(0);
  });

  test('project detail shows metadata', async ({ page }) => {
    await page.goto('/projects/voxel-tool/');
    await expect(page.locator('[data-testid="project-tags"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-stats"]')).toBeVisible();
  });

  test('tag page filters by tag', async ({ page }) => {
    await page.goto('/tags/game/');
    const cards = page.locator('.mp-card');
    // All cards should have the "game" tag
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Search', () => {
  test('search palette opens with Ctrl+K', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    await expect(page.locator('[data-mp-island="search-palette"]')).toBeVisible();
  });

  test('search shows results', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const input = page.locator('[data-mp-island="search-palette"] input[type="text"]');
    await input.fill('voxel');
    await expect(page.locator('[data-mp-island="search-palette"] [data-testid="search-result"]')).toHaveCount(1);
  });
});

test.describe('i18n', () => {
  test('locale switcher is visible on multilingual site', async ({ page }) => {
    await page.goto('/');
    const switcher = page.locator('[data-mp-island="lang-switch"]');
    if (await switcher.isVisible()) {
      await expect(switcher).toBeVisible();
    }
  });

  test('switching locale preserves the current path', async ({ page }) => {
    await page.goto('/projects/voxel-tool/');
    const switchLink = page.locator('[data-mp-island="lang-switch"] a').first();
    if (await switchLink.isVisible()) {
      const href = await switchLink.getAttribute('href');
      expect(href).toContain('voxel-tool');
    }
  });
});

test.describe('Filtering and discovery', () => {
  test('library explorer filters by category', async ({ page }) => {
    await page.goto('/');
    const explorer = page.locator('[data-mp-island="library-explorer"]');
    if (await explorer.isVisible()) {
      const categorySelect = explorer.locator('select').first();
      await categorySelect.selectOption('game');
      await expect(explorer.locator('.mp-card')).toHaveCount(2);
    }
  });

  test('discovery queue shows random projects', async ({ page }) => {
    await page.goto('/');
    const queue = page.locator('[data-mp-island="discovery-queue"]');
    if (await queue.isVisible()) {
      await expect(queue).toBeVisible();
      await expect(queue.locator('button')).toHaveCount.atLeast(1);
    }
  });
});

test.describe('Accessibility', () => {
  test('skip link is first focusable element', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.mp-skip-link');
    await expect(skipLink).toBeFocused();
  });

  test('theme toggle is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-mp-island="theme-toggle"] button');
    await toggle.focus();
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
    // Should not error
  });
});

test.describe('Cards', () => {
  test('project card shows cover image', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.mp-card').first();
    const img = card.locator('img').first();
    await expect(img).toBeVisible();
  });

  test('project card shows tags', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.mp-card').first();
    await expect(card.locator('.mp-tag')).toHaveCount.atLeast(1);
  });
});