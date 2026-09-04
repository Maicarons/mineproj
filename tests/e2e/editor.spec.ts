import { expect, test } from '@playwright/test';

/**
 * Editor E2E tests (M9-17): verifies editor is NOT included in production build.
 * The editor is only available in dev mode with --editor flag.
 */

test.describe('Visual Editor', () => {
  test('editor is NOT included in the production build', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    // Editor-specific classes should not appear in production HTML
    expect(html).not.toContain('mp-editor-form');
    expect(html).not.toContain('mp-editor-');
  });
});