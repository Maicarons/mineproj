// @mineproj/core — build-time kernel: config, data, routes, themes, plugins, hooks.

export const VERSION = '0.0.0' as const;

export * from './config/schema';
export * from './config/define';
export * from './config/load';
export * from './hooks';
export * from './virtual';
export * from './pipeline';
export * from './data/loader';
export * from './data/validate';
export * from './data/assets';
export * from './data/body';
export * from './data/derive';
export * from './data/i18n';
export * from './api/endpoints';
export * from './api/emit';
export * from './api/middleware';
export * from './api/query';
export * from './plugin/contract';
export * from './plugin/registry';
export * from './router/collect';
export * from './theme/contract';
export * from './theme/layout';
export * from './theme/registry';
export * from './theme/resolve';
export * from './theme/slots';
export * from './theme/props';
export * from './render/render';
