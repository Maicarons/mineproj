import type { Project } from '@mineproj/schema';
import type { RouteRecord } from '../virtual';
import type { SiteStats } from '../data/derive';
import type { ComponentType } from 'react';

/**
 * Layout props contract: every theme layout receives these props from the
 * SSR renderer. `data` carries the page slice; `route` identifies the page.
 */

export interface CollectionSummary {
  slug: string;
  name: string;
  description?: string;
  projectSlugs: string[];
}

export interface LayoutData {
  /** Visible projects (hidden excluded), in default sort order. */
  projects: Project[];
  /** Detail routes: the page's own project. */
  project?: Project;
  /** Tag routes: the tag name. */
  tag?: string;
  /** Collection routes: the collection summary. */
  collection?: CollectionSummary;
  /** Tag aggregation with counts. */
  tagCounts: { name: string; count: number }[];
  /** Site statistics. */
  stats: SiteStats;
  /** Author profile (null when absent). */
  profile: unknown;
  /** Raw collections. */
  collections: CollectionSummary[];
}

export interface LayoutProps {
  route: RouteRecord;
  data: LayoutData;
  config: {
    title: string;
    description?: string;
    defaultLocale: string;
  };
  themeConfig: Record<string, unknown>;
  /** Slot name → rendered components (validated by the slot registry). */
  slotComponents?: Record<string, ComponentType<Record<string, unknown>>[]>;
}

export type LayoutComponent = (props: LayoutProps) => React.ReactNode;
