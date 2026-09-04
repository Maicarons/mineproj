import { useState } from 'react';

/**
 * MediaFrame (M4-16): renders `<video>` with controls/preload=metadata
 * (no autoplay) or a facade for external video platforms (YouTube/Bilibili)
 * that only loads the player after a user click.
 */

export interface MediaFrameProps {
  src: string;
  type?: 'video' | 'youtube' | 'bilibili';
  poster?: string;
  caption?: string;
}

export function MediaFrame({ src, type = 'video', poster, caption }: MediaFrameProps): ReactNode {
  const [loaded, setLoaded] = useState(type === 'video'); // video loads natively

  if (type === 'video') {
    return (
      <figure className="mp-panel">
        <video controls preload="metadata" poster={poster} style={{ width: '100%' }}>
          <source src={src} />
        </video>
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    );
  }

  // Facade for YouTube/Bilibili
  const embedUrl = type === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${src}?autoplay=1`
    : `https://player.bilibili.com/player.html?bvid=${src}&autoplay=1`;

  return (
    <figure className="mp-panel">
      {!loaded ? (
        <div
          style={{ position: 'relative', cursor: 'pointer', background: '#000', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLoaded(true)}
          role="button"
          tabIndex={0}
          aria-label="Load video player"
          onKeyDown={(e) => { if (e.key === 'Enter') setLoaded(true); }}
        >
          {poster ? <img src={poster} alt="" style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} /> : null}
          <span style={{ position: 'absolute', fontSize: 48, color: '#fff', opacity: .8, background: 'rgb(0 0 0 / .5)', borderRadius: '50%', padding: '8px 16px' }}>▶</span>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title={caption ?? src}
          allow="autoplay; fullscreen"
          style={{ width: '100%', aspectRatio: '16 / 9', border: 'none' }}
          loading="lazy"
        />
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

type ReactNode = import('react').ReactNode;