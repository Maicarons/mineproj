import type { Project } from '@mineproj/schema';
import { Tag } from './base';

/**
 * ProjectCard (M3-03): 16:9 cover, name, 2-line clamped tagline, up to 3 tag
 * pills (+N), creation date and badge slots. Hover lifts the shadow and
 * scales the cover *inside* its clipped container — box model never changes
 * (no CLS). Without a cover, a hue-stable gradient placeholder is generated
 * from the slug.
 */

export function coverHue(slug: string): number {
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return hash;
}

export function relativeTime(iso: string, now = new Date()): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((now.getTime() - then) / 86_400_000);
  if (Number.isNaN(days)) return '';
  if (days < 30) return `${Math.max(days, 0)}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function badgeFor(project: Project, now: Date): string | undefined {
  const updated = project.updatedAt ?? project.createdAt;
  const daysSinceUpdate = Math.floor((now.getTime() - new Date(updated).getTime()) / 86_400_000);
  if (project.status === 'archived') return 'ARCHIVED';
  if (project.status === 'wip' || project.status === 'idea') return project.status.toUpperCase();
  if (daysSinceUpdate <= 14) return 'UPDATED';
  if (daysSinceUpdate <= 30) return 'NEW';
  return undefined;
}

export function ProjectCard({ project, now = new Date() }: { project: Project; now?: Date }): ReactNode {
  const visibleTags = project.tags.slice(0, 3);
  const extraTags = project.tags.length - visibleTags.length;
  const badge = badgeFor(project, now);
  const hue = coverHue(project.slug);
  const playable = project.playable !== undefined && project.playable.type !== 'none';

  return (
    <article className="mp-card" data-slug={project.slug}>
      <a className="mp-card__cover" href={`/projects/${project.slug}/`} tabIndex={-1} aria-hidden="true">
        {project.cover ? (
          <img src={project.cover} alt="" loading="lazy" className="mp-card__img" />
        ) : (
          <span
            className="mp-card__placeholder"
            style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 45%), hsl(${(hue + 40) % 360} 55% 30%))` }}
          >
            {project.name.charAt(0).toUpperCase()}
          </span>
        )}
        {badge ? <span className="mp-card__badge mp-card__badge--left">{badge}</span> : null}
        {(playable || project.license) && (
          <span className="mp-card__badge mp-card__badge--right">
            {playable ? 'Playable' : ''}
            {playable && project.license ? ' · ' : ''}
            {project.license ? 'OSS' : ''}
          </span>
        )}
      </a>
      <div className="mp-card__body">
        <h3 className="mp-card__title">
          <a href={`/projects/${project.slug}/`}>{project.name}</a>
        </h3>
        <p className="mp-card__tagline">{project.tagline}</p>
        <div className="mp-card__meta">
          <span className="mp-card__tags">
            {visibleTags.map((tag) => (
              <Tag key={tag} label={`#${tag}`} href={`/tags/${tag}/`} />
            ))}
            {extraTags > 0 ? <span className="mp-tag">+{extraTags}</span> : null}
          </span>
          <time dateTime={project.createdAt} className="mp-card__time">
            {relativeTime(project.createdAt, now)}
          </time>
        </div>
      </div>
    </article>
  );
}

type ReactNode = import('react').ReactNode;
