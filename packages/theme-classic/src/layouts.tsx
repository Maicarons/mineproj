import type { LayoutProps } from '@mineproj/core';

/**
 * Minimal layouts for the M2 pipeline (dogfooding the theme contract).
 * The polished classic UI (tokens, cards, filters, islands) lands in M3.
 */

function ProjectList({ projects }: { projects: LayoutProps['data']['projects'] }): React.ReactNode {
  return (
    <ul className="mp-project-list">
      {projects.map((p) => (
        <li key={p.slug}>
          <a href={`/projects/${p.slug}/`}>{p.name}</a> — {p.tagline}
        </li>
      ))}
    </ul>
  );
}

export function HomeLayout({ data, config }: LayoutProps): React.ReactNode {
  return (
    <main id="main">
      <h1>{config.title}</h1>
      {config.description ? <p>{config.description}</p> : null}
      <section aria-label="projects">
        <h2>Projects</h2>
        <ProjectList projects={data.projects} />
      </section>
    </main>
  );
}

export function ListLayout({ data }: LayoutProps): React.ReactNode {
  return (
    <main id="main">
      <h1>Projects</h1>
      <ProjectList projects={data.projects} />
    </main>
  );
}

export function DetailLayout({ data }: LayoutProps): React.ReactNode {
  const p = data.project;
  if (!p) return <NotFoundLayout />;
  return (
    <main id="main">
      <h1>{p.name}</h1>
      <p>{p.tagline}</p>
      <p>{p.summary}</p>
      <p>
        Created {p.createdAt}
        {p.license ? ` · ${p.license}` : ''}
      </p>
      <ul aria-label="tags">
        {p.tags.map((tag) => (
          <li key={tag}>
            <a href={`/tags/${tag}/`}>#{tag}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function TagLayout({ data }: LayoutProps): React.ReactNode {
  const tag = data.tag ?? '';
  const matching = (data.projects ?? []).filter((p) => p.tags.includes(tag));
  return (
    <main id="main">
      <h1>{`#${tag}`}</h1>
      <ProjectList projects={matching} />
    </main>
  );
}

export function CollectionLayout({ data }: LayoutProps): React.ReactNode {
  const collection = data.collection;
  if (!collection) return <NotFoundLayout />;
  const inCollection = (data.projects ?? []).filter((p) => collection.projectSlugs.includes(p.slug));
  return (
    <main id="main">
      <h1>{collection.name}</h1>
      {collection.description ? <p>{collection.description}</p> : null}
      <ProjectList projects={inCollection} />
    </main>
  );
}

export function AboutLayout({ data }: LayoutProps): React.ReactNode {
  const profile = data.profile as { name?: string; bio?: string } | null;
  return (
    <main id="main">
      <h1>About</h1>
      <p>{profile?.name ?? 'Unknown author'}</p>
      {profile?.bio ? <p>{profile.bio}</p> : null}
    </main>
  );
}

export function NotFoundLayout(): React.ReactNode {
  return (
    <main id="main">
      <h1>404 — Not found</h1>
      <p>
        <a href="/">Back to the project library</a>
      </p>
    </main>
  );
}
