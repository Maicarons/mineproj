/**
 * Visual regression tests (M8-03, optional): Playwright screenshot comparison.
 *
 * Usage:
 *   npx playwright test tests/visual/  -- Update baselines with UPDATE_GOLDEN=1
 *
 * These tests capture full-page screenshots of key pages and compare them
 * against stored baselines. When intentional visual changes are made, run:
 *   UPDATE_GOLDEN=1 npx playwright test tests/visual/
 */

import { expect, test } from '@playwright/test';

test.describe('Visual regression', () => {
  test('homepage matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('project detail page matches baseline', async ({ page }) => {
    await page.goto('/projects/voxel-tool/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('project-detail.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('tag page matches baseline', async ({ page }) => {
    await page.goto('/tags/game/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('tag-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('dark mode homepage matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});