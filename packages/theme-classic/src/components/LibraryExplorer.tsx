import { useMemo, useState } from 'react';
import { createElement } from 'react';
import type { Project } from '@mineproj/schema';
import { serializeIslandProps } from '@mineproj/core';
import { ProjectCard } from './ProjectCard';
import { Button, SearchBox, Select, Switch } from './base';
import {
  applyFilters,
  DEFAULT_FILTER_STATE,
  deriveFacets,
  stateToQuery,
  toggleInArray,
  type FilterState,
  type SortKey,
} from './filterLogic';

/**
 * LibraryExplorer (M3-05 + M3-10): toolbar (search, facet chips, sort,
 * exclude-archived) + project grid. Ships prerendered for no-JS readers and
 * hydrates as an island; filter state syncs to the URL query.
 */

export function IslandContainer({
  name,
  props,
  children,
}: {
  name: string;
  props?: unknown;
  children: ReactNode;
}): ReactNode {
  return createElement(
    'div',
    {
      'data-mp-island': name,
      'data-mp-island-props': props === undefined ? undefined : serializeIslandProps(props),
    },
    children,
  );
}

export interface LibraryExplorerProps {
  projects: Project[];
  /** Initial state (from URL at request time); the island re-syncs client-side. */
  initial?: FilterState;
}

export function LibraryExplorer({ projects, initial }: LibraryExplorerProps): ReactNode {
  const [state, setState] = useState<FilterState>(initial ?? DEFAULT_FILTER_STATE);
  const facets = useMemo(() => deriveFacets(projects), [projects]);
  const visible = useMemo(() => applyFilters(projects, state), [projects, state]);

  const update = (patch: Partial<FilterState>): void => {
    const next = { ...state, ...patch };
    setState(next);
    if (typeof window !== 'undefined' && window.history) {
      const qs = stateToQuery(next);
      window.history.replaceState({}, '', `${window.location.pathname}${qs}`);
    }
  };

  const chip = (label: string, active: boolean, onToggle: () => void): ReactNode => (
    <Button
      key={label}
      variant={active ? 'primary' : 'default'}
      aria-pressed={active}
      onClick={onToggle}
    >
      {label}
    </Button>
  );

  return (
    <div className="mp-explorer">
      <div className="mp-toolbar">
        <SearchBox
          value={state.q}
          onChange={(e) => update({ q: (e.target as HTMLInputElement).value })}
          style={{ maxWidth: 280 }}
        />
        <Select
          label="Sort order"
          value={state.sort}
          onChange={(e) => update({ sort: (e.target as HTMLSelectElement).value as SortKey })}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name A–Z</option>
          <option value="updated">Recently updated</option>
        </Select>
        <Switch
          checked={state.excludeArchived}
          onChange={(next) => update({ excludeArchived: next })}
          label="Exclude archived"
        />
        <span className="mp-toolbar__count" role="status">
          {visible.length} / {projects.length}
        </span>
      </div>

      {facets.categories.length > 0 && (
        <div className="mp-toolbar" role="group" aria-label="Filter by category">
          {facets.categories.map((f) =>
            chip(
              f.name,
              state.categories.includes(f.name),
              () => update({ categories: toggleInArray(state.categories, f.name) }),
            ),
          )}
        </div>
      )}
      {facets.tags.length > 0 && (
        <div className="mp-toolbar" role="group" aria-label="Filter by tag">
          {facets.tags.slice(0, 12).map((f) =>
            chip(`#${f.name}`, state.tags.includes(f.name), () =>
              update({ tags: toggleInArray(state.tags, f.name) }),
            ),
          )}
        </div>
      )}

      <div className="mp-grid">
        {visible.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="mp-empty">No projects match the current filters.</p>
      ) : null}
    </div>
  );
}

/** Server-side wrapper that renders the explorer inside its island container. */
export function LibraryExplorerIsland({ projects, initial }: LibraryExplorerProps): ReactNode {
  return (
    <IslandContainer name="library-explorer" props={{ projects, initial: initial ?? DEFAULT_FILTER_STATE }}>
      <LibraryExplorer projects={projects} initial={initial} />
    </IslandContainer>
  );
}

type ReactNode = import('react').ReactNode;
