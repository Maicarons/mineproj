/**
 * Prose component (M4-09): renders markdown body content with proper
 * typography. Applies the `.mp-prose` class for styling.
 */

export function Prose({ html }: { html: string }): ReactNode {
  return <div className="mp-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

type ReactNode = import('react').ReactNode;