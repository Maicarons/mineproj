# Voxel Tool

A tiny voxel editor that runs entirely in the browser.

## Why

Most voxel tools are heavy desktop apps. This one boots in a browser tab and
edits models with a greedy-meshing renderer that stays at 60fps.

```ts
const mesh = buildGreedyMesh(voxelGrid);
renderer.draw(mesh);
```

## Status

Released under Apache-2.0. See the repo for the roadmap.
