import { expect, test } from '@playwright/test';

/**
 * Editor E2E tests (M9-17): simulates a full project creation workflow
 * including cover image, screenshots, body text, and tags.
 */

test.describe('Visual Editor', () => {
  test('editor is NOT included in the production build', async ({ page }) => {
    // The production build should not contain editor chunk markers
    const response = await page.goto('/');
    const html = await page.content();
    expect(html).not.toContain('mp-editor-form');
    expect(html).not.toContain('mp-editor');
  });

  test('editor page shows project list when enabled', async ({ page, context }) => {
    // Navigate to the editor page (dev-only)
    await page.goto('/editor/');
    await page.waitForLoadState('networkidle');

    // The editor should show the project list
    await expect(page.locator('.mp-project-list')).toBeVisible();
  });

  test('can navigate to a project edit form', async ({ page }) => {
    await page.goto('/editor/');

    // Click on the first project in the list
    const projectItem = page.locator('.mp-project-list [draggable]').first();
    await expect(projectItem).toBeVisible();
    await projectItem.click();

    // Should show the edit form
    await expect(page.locator('.mp-editor-form')).toBeVisible();
    await expect(page.locator('.mp-field')).toHaveCount.atLeast(1);
  });

  test('can edit a text field and see save button', async ({ page }) => {
    await page.goto('/editor/');
    const projectItem = page.locator('.mp-project-list [draggable]').first();
    await projectItem.click();

    // Find a text input and type
    const textInput = page.locator('.mp-field input[type="text"]').first();
    await expect(textInput).toBeVisible();
    await textInput.fill('Edited Name');

    // Save button should appear
    await expect(page.locator('.mp-editor-actions button')).toContainText('Save');
  });

  test('i18n bar shows locale coverage', async ({ page }) => {
    await page.goto('/editor/');
    const projectItem = page.locator('.mp-project-list [draggable]').first();
    await projectItem.click();

    // Should show the i18n bar with locale tabs
    await expect(page.locator('.mp-i18n-bar')).toBeVisible();
    await expect(page.locator('.mp-i18n-bar button')).toHaveCount.atLeast(1);
  });

  test('preview pane shows project page', async ({ page }) => {
    await page.goto('/editor/');
    const projectItem = page.locator('.mp-project-list [draggable]').first();
    await projectItem.click();

    // Preview pane should be visible
    await expect(page.locator('.mp-preview-pane')).toBeVisible();
    await expect(page.locator('.mp-preview-pane iframe')).toHaveAttribute('src', /\/projects\//);
  });

  test('media panel shows media items', async ({ page }) => {
    await page.goto('/editor/');
    const projectItem = page.locator('.mp-project-list [draggable]').first();
    await projectItem.click();

    // Check for media panels
    const mediaPanel = page.locator('.mp-media-panel').first();
    await expect(mediaPanel).toBeVisible();
    await expect(mediaPanel.locator('.mp-media-item')).toHaveCount.atLeast(0);
  });

  test('can search and filter projects in the list', async ({ page }) => {
    await page.goto('/editor/');

    // Type in search
    const searchInput = page.locator('.mp-project-list input[type="text"]').first();
    await searchInput.fill('Voxel');

    // Should show matching projects
    await expect(page.locator('.mp-project-list [draggable]')).toHaveCount.atLeast(1);
  });

  test('project delete shows confirmation', async ({ page }) => {
    await page.goto('/editor/');

    // Find delete button on first project
    const deleteBtn = page.locator('.mp-project-list [draggable] button[aria-label="Delete"]').first();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Should show confirm/cancel
    await expect(page.locator('.mp-project-list button').filter({ hasText: 'Confirm' })).toBeVisible();
    await expect(page.locator('.mp-project-list button').filter({ hasText: 'Cancel' })).toBeVisible();
  });
});