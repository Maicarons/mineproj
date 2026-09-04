import { type ReactNode } from 'react';

/**
 * I18nBar (M9-08): language selector for editing multilingual fields.
 * Shows fallback values for untranslated fields, missing badges,
 * and a coverage progress bar.
 */

export interface LocaleCoverage {
  locale: string;
  /** Localized label for the language (e.g. "English", "中文"). */
  label: string;
  /** Number of translated fields. */
  translated: number;
  /** Total fields. */
  total: number;
}

export interface I18nBarProps {
  /** Available locales with coverage data. */
  locales: LocaleCoverage[];
  /** Currently selected locale. */
  activeLocale: string;
  /** Called when the user switches locale. */
  onLocaleChange: (locale: string) => void;
  /** Number of missing fields in the active locale. */
  missingCount?: number;
}

export function I18nBar({ locales, activeLocale, onLocaleChange, missingCount }: I18nBarProps): ReactNode {

  const active = locales.find((l) => l.locale === activeLocale);
  const coverage = active ? Math.round((active.translated / Math.max(active.total, 1)) * 100) : 0;

  return (
    <div className="mp-i18n-bar" style={{ borderBottom: '1px solid var(--mp-color-border, #ddd)', padding: '8px 16px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Language tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {locales.map((loc) => (
            <button
              key={loc.locale}
              type="button"
              className={`mp-btn mp-btn--small ${loc.locale === activeLocale ? 'mp-btn--active' : ''}`}
              onClick={() => onLocaleChange(loc.locale)}
              style={{
                fontWeight: loc.locale === activeLocale ? 600 : undefined,
                borderBottom: loc.locale === activeLocale ? '2px solid var(--mp-color-accent, #0066cc)' : undefined,
              }}
              aria-pressed={loc.locale === activeLocale}
            >
              {loc.label}
              {loc.translated < loc.total && (
                <span style={{ marginLeft: 4, fontSize: 11, color: '#e68a00' }}>
                  ({loc.translated}/{loc.total})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Coverage bar */}
        <div style={{ flex: 1, minWidth: 120, maxWidth: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
            <span>Coverage</span>
            <span>{coverage}%</span>
          </div>
          <div style={{ height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${coverage}%`,
                background: coverage >= 80 ? '#4caf50' : coverage >= 50 ? '#ff9800' : '#f44336',
                borderRadius: 3,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Missing badge */}
        {missingCount !== undefined && missingCount > 0 && (
          <span className="mp-i18n-missing" style={{ fontSize: 12, color: '#e68a00', background: '#fff3e0', padding: '2px 8px', borderRadius: 10 }}>
            {missingCount} field{missingCount !== 1 ? 's' : ''} missing
          </span>
        )}
      </div>
    </div>
  );
}