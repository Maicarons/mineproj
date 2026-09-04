import { useState, useRef, useEffect, type ReactNode } from 'react';

/**
 * PreviewPane (M9-12): an iframe-based live preview that loads the
 * current project page. Supports HMR refresh and scroll position
 * preservation.
 */

export interface PreviewPaneProps {
  /** Base URL of the dev server. */
  baseUrl: string;
  /** Current project slug. */
  slug: string | null;
  /** Whether the preview is dirty (unsaved changes). */
  dirty?: boolean;
  /** If true, auto-refresh the iframe when dirty changes. */
  autoRefresh?: boolean;
}

export function PreviewPane({ baseUrl, slug, dirty, autoRefresh = true }: PreviewPaneProps): ReactNode {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const prevDirty = useRef(dirty);

  const previewUrl = slug
    ? `${baseUrl.replace(/\/+$/, '')}/projects/${encodeURIComponent(slug)}/`
    : null;

  // Auto-refresh on save (dirty → not dirty transition)
  useEffect(() => {
    if (autoRefresh && prevDirty.current && !dirty && iframeRef.current && previewUrl) {
      setLoading(true);
      setError(null);
      // Preserve scroll position
      try {
        const iframe = iframeRef.current;
        if (iframe.contentWindow) {
          setScrollPos(iframe.contentWindow.scrollY || 0);
        }
      } catch {
        // Cross-origin restrictions
      }
      iframeRef.current.src = previewUrl;
    }
    prevDirty.current = dirty;
  }, [dirty, autoRefresh, previewUrl]);

  const handleIframeLoad = () => {
    setLoading(false);
    // Restore scroll position
    if (scrollPos > 0 && iframeRef.current) {
      try {
        const iframe = iframeRef.current;
        if (iframe.contentWindow) {
          iframe.contentWindow.scrollTo(0, scrollPos);
        }
      } catch {
        // Cross-origin
      }
    }
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Failed to load preview');
  };

  if (!previewUrl) {
    return (
      <div className="mp-preview-empty" style={{ padding: 24, textAlign: 'center', color: '#999' }}>
        Select a project to preview
      </div>
    );
  }

  return (
    <div className="mp-preview-pane" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--mp-color-border, #ddd)', fontSize: 13 }}>
        <span style={{ fontWeight: 600 }}>Preview</span>
        {loading && <span style={{ color: '#666' }}>Loading...</span>}
        {dirty && <span style={{ color: '#e68a00', fontSize: 12 }}>Unsaved changes</span>}
        {error && <span style={{ color: '#f44336', fontSize: 12 }}>{error}</span>}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className="mp-btn mp-btn--small"
          onClick={() => {
            if (iframeRef.current && previewUrl) {
              setLoading(true);
              iframeRef.current.src = previewUrl;
            }
          }}
          aria-label="Refresh preview"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Iframe */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#e0e0e0', zIndex: 1 }}>
            <div style={{ height: '100%', width: '30%', background: '#0066cc', animation: 'mp-loading 1.5s infinite' }} />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={previewUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Live preview"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}