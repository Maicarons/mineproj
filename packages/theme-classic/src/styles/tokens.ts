/**
 * Design tokens (M3-01). Stored as a TS template so the pipeline can inline
 * the CSS into every page head without bundler-specific raw imports.
 * Changing values here re-skins the entire theme; components never hardcode
 * colors (CI asserts this).
 */
export const tokensCss = String.raw`
:root {
  /* ── Neutral palette (light default) ─────────────────────── */
  --mp-color-bg:          #FAFAFA;
  --mp-color-surface:     #FFFFFF;
  --mp-color-surface-alt: #F4F4F5;
  --mp-color-border:      #E4E4E7;
  --mp-color-text:        #09090B;   /* 19.8:1 on surface */
  --mp-color-muted:       #52525B;   /*  7.5:1 on surface */
  --mp-color-accent:      #2563EB;
  --mp-color-accent-fg:   #FFFFFF;
  --mp-color-danger:      #DC2626;

  /* ── Spacing (4px base) ──────────────────────────────────── */
  --mp-space-1: 4px;  --mp-space-2: 8px;  --mp-space-3: 12px;  --mp-space-4: 16px;
  --mp-space-5: 20px; --mp-space-6: 24px; --mp-space-8: 32px;  --mp-space-12: 48px;
  --mp-space-16: 64px; --mp-space-24: 96px;

  /* ── Radius (mapped by the radius config option) ─────────── */
  --mp-radius-sm: 6px; --mp-radius-md: 12px; --mp-radius-lg: 16px; --mp-radius-full: 999px;
  --mp-radius-card: var(--mp-radius-md);
  --mp-radius-control: calc(var(--mp-radius-md) / 2);

  /* ── Shadows ─────────────────────────────────────────────── */
  --mp-shadow-1: 0 1px 2px rgb(0 0 0 / .06);
  --mp-shadow-2: 0 8px 24px rgb(0 0 0 / .10);

  /* ── Layout ──────────────────────────────────────────────── */
  --mp-content-width: 1280px;
  --mp-grid-gutter: 24px;
  --mp-nav-height: 64px;

  /* ── Typography ──────────────────────────────────────────── */
  --mp-font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI',
                  'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC',
                  'Microsoft YaHei', sans-serif;
  --mp-font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular',
                  'Cascadia Code', Consolas, monospace;
  --mp-text-display: 40px;
  --mp-text-h2: 24px;
  --mp-text-body: 16px;
  --mp-text-meta: 14px;
  --mp-leading-body: 1.75;
  --mp-leading-heading: 1.3;

  /* ── Motion ──────────────────────────────────────────────── */
  --mp-duration-fast: 150ms;
  --mp-duration: 200ms;
  --mp-duration-slow: 300ms;
  --mp-ease: cubic-bezier(.4, 0, .2, 1);
}

/* ── Dark mode (system or toggle writes data-theme) ─────────── */
:root[data-theme='dark'] {
  --mp-color-bg:          #0B0C0E;
  --mp-color-surface:     #151719;
  --mp-color-surface-alt: #1F2124;
  --mp-color-border:      #2A2D31;
  --mp-color-text:        #E7E9EA;  /* 15.3:1 on surface */
  --mp-color-muted:       #A1A1AA;  /*  7.0:1 on surface */
  --mp-color-accent:      #60A5FA;
  --mp-color-accent-fg:   #0B0C0E;
  --mp-shadow-1: 0 1px 2px rgb(0 0 0 / .40);
  --mp-shadow-2: 0 8px 24px rgb(0 0 0 / .50);
}

/* ── Palette: slate — cool professional ─────────────────────── */
:root[data-palette='slate'] {
  --mp-color-accent: #0E7490;
  --mp-color-bg: #F8FAFC;
  --mp-color-surface-alt: #F1F5F9;
  --mp-color-border: #E2E8F0;
}
:root[data-palette='slate'][data-theme='dark'] {
  --mp-color-accent: #38BDF8;
  --mp-color-bg: #0B1120;
  --mp-color-surface: #101828;
  --mp-color-surface-alt: #1E293B;
  --mp-color-border: #293548;
}

/* ── Palette: warm — humanist ───────────────────────────────── */
:root[data-palette='warm'] {
  --mp-color-accent: #B45309;
  --mp-color-bg: #FAF9F7;
  --mp-color-surface-alt: #F5F1EC;
  --mp-color-border: #E8E2D9;
}
:root[data-palette='warm'][data-theme='dark'] {
  --mp-color-accent: #FBBF24;
  --mp-color-bg: #121110;
  --mp-color-surface: #1B1917;
  --mp-color-surface-alt: #262220;
  --mp-color-border: #322D28;
}

/* ── Palette: showcase — dark immersive gallery ─────────────── */
:root[data-palette='showcase'] {
  --mp-color-bg:          #1B2838;
  --mp-color-surface:     #0F1C25;
  --mp-color-surface-alt: #16222E;
  --mp-color-border:      #2A3F51;
  --mp-color-text:        #C7D5E0;  /* 10.2:1 on surface */
  --mp-color-muted:       #8FA3B0;  /*  5.1:1 on surface */
  --mp-color-accent:      #67C1F5;
  --mp-color-accent-fg:   #0F1C25;
  --mp-color-danger:      #E05555;
  --mp-shadow-1: 0 1px 2px rgb(0 0 0 / .40);
  --mp-shadow-2: 0 8px 24px rgb(0 0 0 / .50);
  --mp-radius-card: 0px;
  --mp-radius-control: 2px;
  --mp-radius-sm: 0px;
  --mp-radius-md: 2px;
  --mp-radius-lg: 4px;
}

/* ── Motion downgrade: one rule covers everything ───────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;
