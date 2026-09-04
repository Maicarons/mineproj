// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { computeDiff, ProjectForm } from './form';
import { computeDiffSummary, saveDraft, loadDraft, clearDraft } from './draft';
import { renderToString } from 'react-dom/server';
import { describeFields } from './describe';
import { projectSchema } from '@mineproj/schema';

describe('ProjectForm (M9-06)', () => {
  const descriptor = describeFields(projectSchema);

  it('renders without crashing', () => {
    const html = renderToString(
      <ProjectForm descriptor={descriptor} data={{}} onChange={() => {}} />
    );
    expect(html).toContain('mp-editor-form');
    expect(html).toContain('Project Name');
  });

  it('shows save button when dirty', () => {
    const html = renderToString(
      <ProjectForm descriptor={descriptor} data={{ name: 'Test' }} onChange={() => {}} dirty onSave={() => {}} />
    );
    expect(html).toContain('Save');
    expect(html).toContain('Unsaved changes');
  });
});

describe('Diff (M9-10)', () => {
  it('detects changed fields', () => {
    const before = { name: 'Old', status: 'released' };
    const after = { name: 'New', status: 'released' };
    expect(computeDiff(before, after)).toEqual(['name']);
  });

  it('detects added and removed fields', () => {
    const before = { name: 'Test' };
    const after = { name: 'Test', tagline: 'New' };
    expect(computeDiff(before, after)).toEqual(['tagline']);
  });

  it('computeDiffSummary returns human-readable changes', () => {
    const draft = {
      path: 'test',
      data: { name: 'New' },
      original: { name: 'Old' },
      timestamp: Date.now(),
    };
    const summary = computeDiffSummary(draft);
    expect(summary[0]?.field).toBe('name');
    expect(summary[0]?.before).toBe('Old');
    expect(summary[0]?.after).toBe('New');
  });
});

describe('Draft persistence (M9-10)', () => {
  it('saves and loads drafts', () => {
    const data = { name: 'Test', tagline: 'Tag' };
    const original = { name: 'Old' };
    saveDraft('test.json', data, original);
    const loaded = loadDraft('test.json');
    if (loaded) {
      expect(loaded.data.name).toBe('Test');
      expect(loaded.original.name).toBe('Old');
      clearDraft('test.json');
      expect(loadDraft('test.json')).toBeNull();
    }
  });
});

describe('MediaPanel (M9-07)', () => {
  it('renders empty state', async () => {
    const { MediaPanel } = await import('./mediaPanel');
    const html = renderToString(
      <MediaPanel label="Gallery" items={[]} onChange={() => {}} />
    );
    expect(html).toContain('No items yet');
    expect(html).toContain('Gallery');
  });

  it('renders items', async () => {
    const { MediaPanel } = await import('./mediaPanel');
    const items = [{ path: '/test.png', alt: 'Test', size: 1024 }];
    const html = renderToString(
      <MediaPanel label="Cover" items={items} onChange={() => {}} />
    );
    expect(html).toContain('/test.png');
  });
});

describe('I18nBar (M9-08)', () => {
  it('renders locale tabs and coverage', async () => {
    const { I18nBar } = await import('./i18nBar');
    const locales = [
      { locale: 'en', label: 'English', translated: 5, total: 10 },
      { locale: 'zh', label: '中文', translated: 3, total: 10 },
    ];
    const html = renderToString(
      <I18nBar locales={locales} activeLocale="en" onLocaleChange={() => {}} missingCount={5} />
    );
    expect(html).toContain('English');
    expect(html).toContain('中文');
    expect(html).toContain('50%');
    expect(html).toContain('missing');
  });
});

describe('ProjectList (M9-09)', () => {
  it('renders project list', async () => {
    const { ProjectList } = await import('./projectList');
    const items = [
      { slug: 'proj-1', name: 'Project 1', status: 'released', updatedAt: '2026-01-01' },
      { slug: 'proj-2', name: 'Project 2', status: 'wip' },
    ];
    const html = renderToString(
      <ProjectList
        items={items}
        onSelect={() => {}}
        onCreate={() => {}}
        onCopy={() => {}}
        onDelete={async () => true}
        onReorder={() => {}}
        onBatchTag={() => {}}
      />
    );
    expect(html).toContain('Project 1');
    expect(html).toContain('Project 2');
    expect(html).toContain('released');
  });
});

describe('PreviewPane (M9-12)', () => {
  it('renders empty state when no slug', async () => {
    const { PreviewPane } = await import('./previewPane');
    const html = renderToString(
      <PreviewPane baseUrl="http://localhost:5173" slug={null} />
    );
    expect(html).toContain('Select a project to preview');
  });

  it('renders iframe with project URL', async () => {
    const { PreviewPane } = await import('./previewPane');
    const html = renderToString(
      <PreviewPane baseUrl="http://localhost:5173" slug="my-project" />
    );
    expect(html).toContain('my-project');
    expect(html).toContain('iframe');
  });
});

describe('Editor security (M9-15)', () => {
  it('validates upload size', async () => {
    const { validateUpload } = await import('./security');
    const result = validateUpload({ name: 'test.png', type: 'image/png', size: 20 * 1024 * 1024 });
    expect(result).toContain('exceeds maximum size');
  });

  it('validates file extension', async () => {
    const { validateUpload } = await import('./security');
    const result = validateUpload({ name: 'test.exe', type: 'application/x-msdownload', size: 1000 });
    expect(result).toContain('not allowed');
  });

  it('passes valid upload', async () => {
    const { validateUpload } = await import('./security');
    const result = validateUpload({ name: 'test.png', type: 'image/png', size: 1000 });
    expect(result).toBeNull();
  });

  it('sanitizes SVGs', async () => {
    const { sanitizeSvg } = await import('./security');
    const dirty = '<svg><script>alert(1)</script><text onmouseover="evil()">Hello</text></svg>';
    const clean = sanitizeSvg(dirty);
    expect(clean).not.toContain('alert');
    expect(clean).not.toContain('onmouseover');
    expect(clean).toContain('Hello');
  });

  it('disabled by default', async () => {
    const { isEditorAllowed } = await import('./security');
    const result = isEditorAllowed({ enabled: false });
    expect(result.allowed).toBe(false);
  });
});

describe('Editor plugins (M9-16)', () => {
  it('registers and runs field render hooks', async () => {
    const { registerEditorHooks, applyFieldRenderHooks, clearEditorHooks } = await import('./plugins');
    registerEditorHooks({
      'editor:field:render': [(field) => ({ ...field, modified: true })],
    });
    const result = applyFieldRenderHooks({ name: 'test' }, {});
    expect(result).toHaveProperty('modified', true);
    clearEditorHooks();
  });

  it('beforeSave can cancel', async () => {
    const { registerEditorHooks, runBeforeSaveHooks, clearEditorHooks } = await import('./plugins');
    registerEditorHooks({
      beforeSave: [async () => ({ cancelled: true, reason: 'Not ready' })],
    });
    const result = await runBeforeSaveHooks({ name: 'test' }, {});
    expect(result.cancelled).toBe(true);
    expect(result.reason).toBe('Not ready');
    clearEditorHooks();
  });

  it('transport hook provides custom transport', async () => {
    const { registerEditorHooks, resolveTransportHooks, clearEditorHooks } = await import('./plugins');
    const mockTransport = { read: async () => null, write: async () => ({ success: true, path: '' }), delete: async () => ({ success: true, path: '' }), list: async () => [] };
    registerEditorHooks({
      transport: [() => mockTransport],
    });
    const result = resolveTransportHooks('test.md', {});
    expect(result).toBe(mockTransport);
    clearEditorHooks();
  });
});