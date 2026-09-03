import type { ResolvedMineprojConfig } from '../config/schema';
import { deriveTags } from '../data/derive';
import type { Dataset } from '../data/loader';
import type { RouteRecord } from '../virtual';

/**
 * Route collector (M2-04): derives the seven core route types from the
 * dataset — home, list, detail, tag, collection, about and 404. Plugins can
 * add or replace routes through the `routes:collect` waterfall hook.
 */

export const CORE_LAYOUTS = ['home', 'list', 'detail', 'tag', 'collection', 'about', 'notFound'] as const;

export function collectRoutes(dataset: Dataset, config: ResolvedMineprojConfig): RouteRecord[] {
  const visible = dataset.projects.filter((p) => !p.hidden);
  const routes: RouteRecord[] = [
    { path: '/', layout: 'home', title: config.site.title },
    { path: '/projects/', layout: 'list', title: 'Projects' },
  ];

  for (const project of visible) {
    routes.push({
      path: `/projects/${project.slug}/`,
      layout: 'detail',
      slug: project.slug,
      title: project.name,
    });
  }

  for (const tag of deriveTags(visible, dataset.tags)) {
    routes.push({ path: `/tags/${tag.name}/`, layout: 'tag', tag: tag.name, title: `#${tag.name}` });
  }

  for (const collection of dataset.collections) {
    routes.push({
      path: `/collections/${collection.slug}/`,
      layout: 'collection',
      collection: collection.slug,
      title: collection.name,
    });
  }

  routes.push({ path: '/about/', layout: 'about', title: 'About' });
  routes.push({ path: '/404.html', layout: 'notFound', title: 'Not found' });
  return routes;
}
