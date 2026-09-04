/** Component-level styles (M3-02). Only var(--mp-*) tokens — no raw colors. */
export const componentsCss = String.raw`
.mp-btn {
  display: inline-flex; align-items: center; gap: var(--mp-space-2);
  padding: var(--mp-space-2) var(--mp-space-4);
  border: 1px solid var(--mp-color-border); border-radius: var(--mp-radius-control);
  background: var(--mp-color-surface); color: var(--mp-color-text);
  font: inherit; font-size: var(--mp-text-meta); cursor: pointer;
  transition: border-color var(--mp-duration) var(--mp-ease), box-shadow var(--mp-duration) var(--mp-ease);
}
.mp-btn:hover { border-color: var(--mp-color-accent); box-shadow: var(--mp-shadow-1); }
.mp-btn:disabled { opacity: .5; cursor: not-allowed; }
.mp-btn--primary { background: var(--mp-color-accent); color: var(--mp-color-accent-fg); border-color: var(--mp-color-accent); }
.mp-btn--primary:hover { box-shadow: var(--mp-shadow-2); }

.mp-tag {
  display: inline-block; padding: 2px var(--mp-space-3);
  border-radius: var(--mp-radius-full);
  background: var(--mp-color-surface-alt); color: var(--mp-color-muted);
  font-size: var(--mp-text-meta); line-height: 1.6; text-decoration: none;
}
a.mp-tag:hover { color: var(--mp-color-accent); }

.mp-input, .mp-select {
  width: 100%; padding: var(--mp-space-2) var(--mp-space-3);
  border: 1px solid var(--mp-color-border); border-radius: var(--mp-radius-control);
  background: var(--mp-color-surface); color: var(--mp-color-text); font: inherit;
}
.mp-input::placeholder { color: var(--mp-color-muted); }

.mp-panel {
  background: var(--mp-color-surface); border: 1px solid var(--mp-color-border);
  border-radius: var(--mp-radius-md); padding: var(--mp-space-4);
}

.mp-tooltip { position: relative; display: inline-block; }
.mp-tooltip__body {
  position: absolute; bottom: calc(100% + var(--mp-space-2)); left: 50%;
  transform: translateX(-50%); padding: var(--mp-space-1) var(--mp-space-2);
  background: var(--mp-color-text); color: var(--mp-color-surface);
  font-size: var(--mp-text-meta); border-radius: var(--mp-radius-control);
  white-space: nowrap; opacity: 0; pointer-events: none;
  transition: opacity var(--mp-duration-fast) var(--mp-ease);
}
.mp-tooltip:hover .mp-tooltip__body,
.mp-tooltip:focus-within .mp-tooltip__body { opacity: 1; }

.mp-skeleton {
  background: linear-gradient(90deg, var(--mp-color-surface-alt) 25%, var(--mp-color-border) 50%, var(--mp-color-surface-alt) 75%);
  background-size: 200% 100%;
  animation: mp-shimmer 1.4s infinite;
  border-radius: var(--mp-radius-control);
}
@keyframes mp-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

.mp-pagination { display: flex; gap: var(--mp-space-2); list-style: none; padding: 0; }
.mp-pagination__link { min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; }
.mp-pagination__link[aria-current='page'] { background: var(--mp-color-accent); color: var(--mp-color-accent-fg); border-color: var(--mp-color-accent); }

.mp-switch { display: inline-flex; align-items: center; gap: var(--mp-space-2); cursor: pointer; }
.mp-switch__track {
  width: 40px; height: 22px; border-radius: var(--mp-radius-full);
  background: var(--mp-color-border); position: relative;
  transition: background var(--mp-duration) var(--mp-ease);
}
.mp-switch__thumb {
  position: absolute; top: 2px; left: 2px; width: 18px; height: 18px;
  border-radius: 50%; background: var(--mp-color-surface); box-shadow: var(--mp-shadow-1);
  transition: left var(--mp-duration) var(--mp-ease);
}
.mp-switch[aria-checked='true'] .mp-switch__track { background: var(--mp-color-accent); }
.mp-switch[aria-checked='true'] .mp-switch__thumb { left: 20px; }

.mp-modal-backdrop {
  position: fixed; inset: 0; background: rgb(0 0 0 / .45);
  display: flex; align-items: flex-start; justify-content: center;
  padding: var(--mp-space-16) var(--mp-space-4); z-index: 100;
}
.mp-modal {
  width: min(560px, 100%); background: var(--mp-color-surface);
  border: 1px solid var(--mp-color-border); border-radius: var(--mp-radius-md);
  box-shadow: var(--mp-shadow-2); padding: var(--mp-space-6);
}

/* Focus ring: single visible rule for every interactive element. */
.mp-btn:focus-visible, .mp-tag:focus-visible, .mp-input:focus-visible,
.mp-select:focus-visible, .mp-pagination__link:focus-visible,
.mp-switch:focus-visible, .mp-modal__close:focus-visible {
  outline: 2px solid var(--mp-color-accent);
  outline-offset: 2px;
}
`;
