import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';

/**
 * Base component layer (M3-02). Keyboard-accessible, aria-annotated, and
 * styled exclusively through design tokens.
 */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' };

export function Button({ variant = 'default', className = '', ...rest }: ButtonProps): ReactNode {
  const variantClass = variant === 'primary' ? ' mp-btn--primary' : '';
  return <button type="button" className={`mp-btn${variantClass} ${className}`.trim()} {...rest} />;
}

export function Tag({ label, href }: { label: string; href?: string }): ReactNode {
  return href ? (
    <a className="mp-tag" href={href}>{label}</a>
  ) : (
    <span className="mp-tag">{label}</span>
  );
}

export function SearchBox(props: InputHTMLAttributes<HTMLInputElement>): ReactNode {
  return (
    <input
      type="search"
      className="mp-input"
      placeholder="Search projects…"
      aria-label="Search projects"
      {...props}
    />
  );
}

export function Select({ label, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }): ReactNode {
  return (
    <label className="mp-select-wrap">
      <span className="mp-visually-hidden">{label}</span>
      <select className="mp-select" aria-label={label} {...rest}>{children}</select>
    </label>
  );
}

export function Panel({ title, children }: { title?: string; children: ReactNode }): ReactNode {
  return (
    <section className="mp-panel">
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }): ReactNode {
  return (
    <span className="mp-tooltip" tabIndex={0} aria-label={label}>
      {children}
      <span role="tooltip" className="mp-tooltip__body">{label}</span>
    </span>
  );
}

export function Skeleton({ width = '100%', height = 16 }: { width?: string; height?: number }): ReactNode {
  return <div className="mp-skeleton" style={{ width, height }} aria-hidden="true" />;
}

export interface PageItem {
  page: number;
  href: string;
  current: boolean;
}

export function Pagination({ items, label = 'Pagination' }: { items: PageItem[]; label?: string }): ReactNode {
  return (
    <nav className="mp-pagination" aria-label={label}>
      {items.map((item) => (
        <a
          key={item.page}
          className="mp-pagination__link mp-btn"
          href={item.href}
          aria-current={item.current ? 'page' : undefined}
        >
          {item.page}
        </a>
      ))}
    </nav>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}): ReactNode {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="mp-switch"
      onClick={() => onChange(!checked)}
    >
      <span className="mp-switch__track">
        <span className="mp-switch__thumb" />
      </span>
      <span>{label}</span>
    </button>
  );
}

/** Modal with focus trap, Escape-to-close and background scroll lock. */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}): ReactNode {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div
        className="mp-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button type="button" className="mp-btn mp-modal__close" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function useLocalState<T>(key: string, initial: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  const set = (next: T): void => {
    setValue(next);
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage unavailable — state stays in memory */
    }
  };
  return [value, set];
}
