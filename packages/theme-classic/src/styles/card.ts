/** Card + page scaffold styles (M3-03/04). Token-only. */
export const cardCss = String.raw`
.mp-card {
  background: var(--mp-color-surface);
  border: 1px solid var(--mp-color-border);
  border-radius: var(--mp-radius-card);
  overflow: hidden;
  transition: border-color var(--mp-duration) var(--mp-ease),
              box-shadow var(--mp-duration) var(--mp-ease),
              transform var(--mp-duration) var(--mp-ease);
}
.mp-card:hover {
  border-color: var(--mp-color-accent);
  box-shadow: var(--mp-shadow-2);
  transform: translateY(-2px);
}
.mp-card:focus-within { outline: 2px solid var(--mp-color-accent); outline-offset: 2px; }

.mp-card__cover {
  position: relative; display: block; aspect-ratio: 16 / 9;
  overflow: hidden; background: var(--mp-color-surface-alt);
}
.mp-card__img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform var(--mp-duration-slow) var(--mp-ease);
}
.mp-card:hover .mp-card__img { transform: scale(1.03); }
.mp-card__placeholder {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: rgb(255 255 255 / .92); font-size: var(--mp-text-display); font-weight: 700;
}

.mp-card__badge {
  position: absolute; top: var(--mp-space-2);
  padding: 2px var(--mp-space-2); border-radius: var(--mp-radius-full);
  background: rgb(0 0 0 / .65); color: #fff;
  font-size: var(--mp-text-meta); line-height: 1.6; letter-spacing: .04em;
}
.mp-card__badge--left { left: var(--mp-space-2); }
.mp-card__badge--right { right: var(--mp-space-2); }

.mp-card__body { padding: var(--mp-space-4); }
.mp-card__title { margin: 0 0 var(--mp-space-1); font-size: var(--mp-text-body); }
.mp-card__title a { color: var(--mp-color-text); text-decoration: none; }
.mp-card__title a:hover { color: var(--mp-color-accent); }
.mp-card__tagline {
  margin: 0 0 var(--mp-space-3); color: var(--mp-color-muted); font-size: var(--mp-text-meta);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  min-height: calc(1.6em * 2);
}
.mp-card__meta {
  display: flex; justify-content: space-between; align-items: center; gap: var(--mp-space-2);
}
.mp-card__tags { display: flex; gap: var(--mp-space-1); flex-wrap: wrap; }
.mp-card__time { color: var(--mp-color-muted); font-size: var(--mp-text-meta); white-space: nowrap; }

/* ── Page scaffold (M3-04/05) ─────────────────────────────── */
.mp-nav {
  position: sticky; top: 0; z-index: 50; height: var(--mp-nav-height);
  display: flex; align-items: center; gap: var(--mp-space-6);
  padding: 0 var(--mp-space-6);
  background: color-mix(in srgb, var(--mp-color-bg) 85%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid transparent;
  transition: border-color var(--mp-duration) var(--mp-ease);
}
.mp-nav:hover, .mp-nav:focus-within { border-bottom-color: var(--mp-color-border); }
.mp-nav__brand { font-weight: 700; color: var(--mp-color-text); text-decoration: none; }
.mp-nav__links { display: flex; gap: var(--mp-space-4); margin-left: auto; }
.mp-nav__links a { color: var(--mp-color-muted); text-decoration: none; min-height: 44px; display: inline-flex; align-items: center; }
.mp-nav__links a:hover { color: var(--mp-color-accent); }

.mp-container { max-width: var(--mp-content-width); margin: 0 auto; padding: 0 var(--mp-space-6); }
.mp-hero { text-align: center; padding: var(--mp-space-24) 0 var(--mp-space-16); }
.mp-hero h1 { font-size: var(--mp-text-display); margin: 0 0 var(--mp-space-4); }
.mp-hero p { color: var(--mp-color-muted); max-width: 720px; margin: 0 auto var(--mp-space-8); }
.mp-hero__stats { color: var(--mp-color-muted); font-size: var(--mp-text-meta); }

.mp-section { padding: var(--mp-space-16) 0; }
.mp-section > h2 { font-size: var(--mp-text-h2); }

.mp-grid {
  display: grid; gap: var(--mp-grid-gutter);
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
@media (max-width: 1440px) { .mp-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 1024px) { .mp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 768px)  { .mp-grid { grid-template-columns: 1fr; } }

.mp-featured { display: grid; gap: var(--mp-grid-gutter); grid-template-columns: 2fr 1fr; }
.mp-featured__side { display: grid; gap: var(--mp-grid-gutter); grid-template-rows: 1fr 1fr; }
@media (max-width: 768px) { .mp-featured { grid-template-columns: 1fr; } }

.mp-footer {
  border-top: 1px solid var(--mp-color-border);
  padding: var(--mp-space-12) 0; color: var(--mp-color-muted); font-size: var(--mp-text-meta);
}
.mp-footer a { color: inherit; }
.mp-footer a:hover { color: var(--mp-color-accent); }

.mp-skip-link {
  position: absolute; left: -9999px;
  background: var(--mp-color-accent); color: var(--mp-color-accent-fg);
  padding: var(--mp-space-2) var(--mp-space-4); z-index: 200;
}
.mp-skip-link:focus { left: var(--mp-space-4); top: var(--mp-space-4); }

.mp-toolbar { display: flex; flex-wrap: wrap; gap: var(--mp-space-3); align-items: center; margin-bottom: var(--mp-space-6); }
.mp-toolbar__count { margin-left: auto; color: var(--mp-color-muted); font-size: var(--mp-text-meta); }
.mp-visually-hidden {
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap;
}
`;
