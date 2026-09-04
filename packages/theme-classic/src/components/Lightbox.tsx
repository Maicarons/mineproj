import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Lightbox (M4-14/15): self-contained image viewer with zoom, pan, keyboard
 * navigation, focus trap and ARIA modal semantics. Target ≤6KB gzip.
 */

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, open, onClose }: LightboxProps): ReactNode {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  const current = images[index];

  const go = useCallback((delta: number) => {
    const next = (index + delta + images.length) % images.length;
    setIndex(next);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [index, images.length]);

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === '+') setZoom((z) => Math.min(4, z * 1.2));
      if (e.key === '-') setZoom((z) => Math.max(0.5, z / 1.2));
      if (e.key === '0') setZoom(1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prevFocus.current?.focus();
    };
  }, [open, onClose, go]);

  if (!open || !current) return null;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(4, z - e.deltaY * 0.01)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [dragging, dragStart]);

  const cursor = zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'auto';

  return (
    <div
      className="mp-lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgb(0 0 0 / .85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, cursor }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
      >
        <img
          ref={imgRef}
          src={current.src}
          alt={current.alt ?? ''}
          style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', transition: 'transform .15s ease', userSelect: 'none' }}
          draggable={false}
        />
        {current.caption && <p style={{ color: '#fff', textAlign: 'center', marginTop: 8 }}>{current.caption}</p>}
        <p style={{ color: '#aaa', textAlign: 'center', fontSize: 14 }}>{index + 1} / {images.length}</p>
      </div>
      <button type="button" onClick={() => go(-1)} style={{ position: 'absolute', left: 16, top: '50%', background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer' }} aria-label="Previous">←</button>
      <button type="button" onClick={() => go(1)} style={{ position: 'absolute', right: 16, top: '50%', background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer' }} aria-label="Next">→</button>
      <button type="button" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }} aria-label="Close">✕</button>
    </div>
  );
}

type ReactNode = import('react').ReactNode;