# examples/basic

The minimal mineproj example site: five projects in directory form
(`data/projects/<slug>/index.json` + cover), a profile, a tag dictionary and a
`mineproj.config.ts`.

## Build

From the repository root:

```sh
node packages/cli/dist/cli.js build --root examples/basic
```

The output lands in `examples/basic/dist/` — serve it with any static file
server, e.g. `python -m http.server -d examples/basic/dist 8080`.
