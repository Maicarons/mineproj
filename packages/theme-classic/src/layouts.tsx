import type { LayoutProps } from '@mineproj/core';
import { LibraryExplorerIsland } from './components/LibraryExplorer';
import { ProjectCard } from './components/ProjectCard';

/**
 * Classic layouts (M3-04 … M3-07): Nav / Hero / Featured / grid / Footer for
 * the home page, an interactive explorer on the list page, a two-column
 * detail page and semantic secondary pages. All styling flows through
 * design tokens; interactive regions are islands.
 */

function Nav({ config }: { config: LayoutProps['config'] }): React.ReactNode {
  return (
    <nav className="mp-nav" aria-label="Site">
      <a className="mp-nav__brand" href="/">{config.title}</a>
      <div className="mp-nav__links">
        <a href="/projects/">Projects</a>
        <a href="/about/">About</a>
      </div>
    </nav>
  );
}

function Footer({ config }: { config: LayoutProps['config'] }): React.ReactNode {
  return (
    <footer className="mp-footer">
      <div className="mp-container">
        <p>
          © {new Date().getFullYear()} {config.title} · <a href="/api/v1/projects.json">API</a>
        </p>
      </div>
    </footer>
  );
}

function Page({ config, children }: { config: LayoutProps['config']; children: React.ReactNode }): React.ReactNode {
  return (
    <>
      <a className="mp-skip-link" href="#main">Skip to content</a>
      <Nav config={config} />
      {children}
      <Footer config={config} />
    </>
  );
}

export function HomeLayout({ data, config }: LayoutProps): React.ReactNode {
  const featured = data.projects.filter((p) => p.featured).slice(0, 3);
  return (
    <Page config={config}>
      <header className="mp-hero mp-container">
        <h1>{config.title}</h1>
        {config.description ? <p>{config.description}</p> : null}
        <p className="mp-hero__stats">
          {data.stats.total} projects · {data.stats.playable} playable · {data.stats.openSource} open source
        </p>
      </header>
      <div className="mp-container">
        {featured.length > 0 && (
          <section className="mp-section" aria-label="Featured">
            <h2>Featured</h2>
            <div className="mp-featured">
              <ProjectCard project={featured[0]!} />
              <div className="mp-featured__side">
                {featured.slice(1, 3).map((p) => (
                  <ProjectCard key={p.slug} project={p} />
                ))}
              </div>
            </div>
          </section>
        )}
        <section className="mp-section" aria-label="All projects">
          <h2>All projects</h2>
          <div className="mp-grid">
            {data.projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
        <section className="mp-section" aria-label="About">
          <h2>About</h2>
          <p>{(data.profile as { bio?: string } | null)?.bio ?? config.description ?? ''}</p>
          <p>
            <a href="/about/">More about me →</a>
          </p>
        </section>
      </div>
    </Page>
  );
}

export function ListLayout({ data, config }: LayoutProps): React.ReactNode {
  return (
    <Page config={config}>
      <div className="mp-container mp-section">
        <h1>Projects</h1>
        <LibraryExplorerIsland projects={data.projects} />
      </div>
    </Page>
  );
}

function Meta({ project }: { project: NonNullable<LayoutProps['data']['project']> }): React.ReactNode {
  return (
    <aside className="mp-panel" aria-label="Project information">
      {project.cover ? <img src={project.cover} alt="" width={320} /> : null}
      <dl>
        <dt>Created</dt>
        <dd>{project.createdAt.slice(0, 10)}</dd>
        {project.license ? (
          <>
            <dt>License</dt>
            <dd>{project.license}</dd>
          </>
        ) : null}
        {(project.techStack ?? []).length > 0 ? (
          <>
            <dt>Tech</dt>
            <dd>{(project.techStack ?? []).join(', ')}</dd>
          </>
        ) : null}
      </dl>
      {(project.links ?? []).length > 0 ? (
        <p>
          {(project.links ?? []).map((link) => (
            <a key={link.url} href={link.url}>
              {link.label ?? link.type}
            </a>
          ))}
        </p>
      ) : null}
    </aside>
  );
}

export function DetailLayout({ data, config }: LayoutProps): React.ReactNode {
  const p = data.project;
  if (!p) return <NotFoundLayout />;
  return (
    <Page config={config}>
      <div className="mp-container mp-section">
        <h1>{p.name}</h1>
        <p>{p.tagline}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--mp-space-8)' }}>
          <div>
            <p>{p.summary}</p>
            {p.highlights.length > 0 ? (
              <section aria-label="Highlights">
                <h2>Highlights</h2>
                <ul>
                  {p.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {p.tags.length > 0 ? (
              <p aria-label="Tags">
                {p.tags.map((tag) => (
                  <a key={tag} href={`/tags/${tag}/`} style={{ marginRight: 'var(--mp-space-2)' }}>
                    {`#${tag}`}
                  </a>
                ))}
              </p>
            ) : null}
          </div>
          <Meta project={p} />
        </div>
      </div>
    </Page>
  );
}

export function TagLayout({ data, config }: LayoutProps): React.ReactNode {
  const tag = data.tag ?? '';
  const matching = (data.projects ?? []).filter((p) => p.tags.includes(tag));
  return (
    <Page config={config}>
      <div className="mp-container mp-section">
        <h1>{`#${tag}`}</h1>
        <div className="mp-grid">
          {matching.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </div>
    </Page>
  );
}

export function CollectionLayout({ data, config }: LayoutProps): React.ReactNode {
  const collection = data.collection;
  if (!collection) return <NotFoundLayout />;
  const inCollection = (data.projects ?? []).filter((p) => collection.projectSlugs.includes(p.slug));
  return (
    <Page config={config}>
      <div className="mp-container mp-section">
        <h1>{collection.name}</h1>
        {collection.description ? <p>{collection.description}</p> : null}
        <div className="mp-grid">
          {inCollection.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </div>
    </Page>
  );
}

export function AboutLayout({ data, config }: LayoutProps): React.ReactNode {
  const profile = data.profile as { name?: string; bio?: string; skills?: string[] } | null;
  return (
    <Page config={config}>
      <div className="mp-container mp-section">
        <h1>About</h1>
        <h2>{profile?.name ?? 'Unknown author'}</h2>
        {profile?.bio ? <p>{profile.bio}</p> : null}
        {profile?.skills && profile.skills.length > 0 ? (
          <ul aria-label="Skills">
            {profile.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </Page>
  );
}

export function NotFoundLayout(): React.ReactNode {
  return (
    <main id="main" className="mp-container mp-section">
      <h1>404 — Not found</h1>
      <p>
        <a href="/">Back to the project library</a>
      </p>
    </main>
  );
}
