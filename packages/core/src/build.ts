/**
 * Legacy entry re-exported by `./pipeline` — the real build orchestrator
 * (with plugin hooks, theme resolution and SSR) lives in pipeline.ts.
 */
export {
  buildSite,
  BuildError,
  type BuildOptions,
  type BuildResult,
  type PluginEmitContext,
} from './pipeline';
