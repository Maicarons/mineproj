import type { MineprojPlugin } from '@mineproj/core';

/** plugin-analytics (M6-11) and plugin-msw / plugin-pwa (M6-10/14). */

export type AnalyticsProvider = 'umami' | 'plausible' | 'ga';

/** Build the analytics loader snippet. Disabled when DNT is on (checked at runtime). */
export function buildAnalyticsSnippet(provider: AnalyticsProvider, id: string, scriptHost: string): string {
  const dntGuard = 'if(navigator.doNotTrack==="1"){return;}';
  if (provider === 'umami') {
    return `${dntGuard}(function(){var s=document.createElement('script');s.src='${scriptHost}/script.js';s.setAttribute('data-website-id','${id}');document.head.appendChild(s);})();`;
  }
  if (provider === 'plausible') {
    return `${dntGuard}(function(){var s=document.createElement('script');s.src='${scriptHost}/js/script.js';s.setAttribute('data-domain','${id}');document.head.appendChild(s);})();`;
  }
  return `${dntGuard}(function(){var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=${id}';s.async=true;document.head.appendChild(s);})();`;
}

export function defineAnalyticsPlugin(provider: AnalyticsProvider, id: string, scriptHost: string): MineprojPlugin {
  return {
    name: '@mineproj/plugin-analytics',
    enforce: 'post',
    hooks: {
      'render:before': (html) => {
        const snippet = `<script>${buildAnalyticsSnippet(provider, id, scriptHost)}</script>`;
        return (html as string).replace('</head>', `${snippet}\n</head>`);
      },
    },
  };
}

export interface MswHandler {
  method: 'GET' | 'POST';
  path: string;
  status?: number;
  body: unknown;
  delayMs?: number;
}

/** Generate a service worker that mocks API endpoints (dev/preview only). */
export function buildServiceWorker(handlers: MswHandler[]): string {
  const payload = JSON.stringify(handlers).replaceAll('<', '\\u003c');
  return [
    'const HANDLERS = ' + payload + ';',
    'self.addEventListener("fetch", (event) => {',
    '  const url = new URL(event.request.url);',
    '  const match = HANDLERS.find((h) => h.path === url.pathname && h.method === event.request.method);',
    '  if (!match) return;',
    '  const respond = () => new Response(JSON.stringify(match.body), {',
    '    status: match.status || 200,',
    '    headers: { "Content-Type": "application/json" },',
    '  });',
    '  event.respondWith(',
    '    (match.delayMs ? new Promise((r) => setTimeout(r, match.delayMs)) : Promise.resolve()).then(respond),',
    '  );',
    '});',
    '',
  ].join('\n');
}

/** plugin-pwa (M6-14): thin passthrough of vite-plugin-pwa options (M2-13 channel). */
export function definePwaPassthrough(vitePluginPwaOptions: Record<string, unknown>): {
  name: string;
  vitePlugin: string;
  options: Record<string, unknown>;
} {
  return {
    name: '@mineproj/plugin-pwa',
    vitePlugin: 'vite-plugin-pwa',
    options: vitePluginPwaOptions,
  };
}
