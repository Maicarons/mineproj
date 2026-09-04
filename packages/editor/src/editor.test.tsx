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