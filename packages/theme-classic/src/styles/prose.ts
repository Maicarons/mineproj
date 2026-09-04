/** Prose CSS (M4-09): typography for rendered markdown content. */
export const proseCss = String.raw`
.mp-prose {
  max-width: 720px;
  color: var(--mp-color-text);
  font-size: var(--mp-text-body);
  line-height: var(--mp-leading-body);
}
.mp-prose h1, .mp-prose h2, .mp-prose h3, .mp-prose h4 {
  margin: var(--mp-space-6) 0 var(--mp-space-3);
  font-weight: 600;
  line-height: var(--mp-leading-heading);
}
.mp-prose h1 { font-size: 32px; border-bottom: 1px solid var(--mp-color-border); padding-bottom: var(--mp-space-2); }
.mp-prose h2 { font-size: 24px; }
.mp-prose h3 { font-size: 20px; }
.mp-prose p { margin: 0 0 var(--mp-space-4); }
.mp-prose a { color: var(--mp-color-accent); text-decoration: none; }
.mp-prose a:hover { text-decoration: underline; }
.mp-prose img { max-width: 100%; height: auto; border-radius: var(--mp-radius-control); }
.mp-prose blockquote {
  margin: var(--mp-space-4) 0;
  padding: var(--mp-space-2) var(--mp-space-4);
  border-left: 4px solid var(--mp-color-accent);
  background: var(--mp-color-surface-alt);
  color: var(--mp-color-muted);
}
.mp-prose code {
  background: var(--mp-color-surface-alt);
  padding: 2px var(--mp-space-1);
  border-radius: var(--mp-radius-control);
  font-size: .9em;
}
.mp-prose pre {
  background: var(--mp-color-surface-alt);
  padding: var(--mp-space-4);
  border-radius: var(--mp-radius-control);
  overflow-x: auto;
  margin: var(--mp-space-4) 0;
}
.mp-prose pre code {
  background: none;
  padding: 0;
}
.mp-prose table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--mp-space-4) 0;
}
.mp-prose th, .mp-prose td {
  padding: var(--mp-space-2) var(--mp-space-3);
  border: 1px solid var(--mp-color-border);
  text-align: left;
}
.mp-prose th {
  background: var(--mp-color-surface-alt);
  font-weight: 600;
}
.mp-prose ul, .mp-prose ol {
  margin: var(--mp-space-4) 0;
  padding-left: var(--mp-space-6);
}
.mp-prose li { margin: var(--mp-space-1) 0; }
.mp-prose hr {
  border: none;
  border-top: 1px solid var(--mp-color-border);
  margin: var(--mp-space-8) 0;
}
.mp-prose .footnotes {
  font-size: var(--mp-text-meta);
  color: var(--mp-color-muted);
  border-top: 1px solid var(--mp-color-border);
  margin-top: var(--mp-space-8);
  padding-top: var(--mp-space-4);
}
.mp-prose .task-list-item { list-style: none; }
.mp-prose .task-list-item input[type="checkbox"] { margin-right: var(--mp-space-2); }
`;