# v1.0.0 Release Checklist

## Pre-release

- [ ] All M0–M8 tasks complete and verified
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm -r test` — all tests pass
- [ ] `pnpm -r build` — all packages build successfully
- [ ] `pnpm --filter @mineproj/e2e build` — example site builds
- [ ] `pnpm --filter @mineproj/e2e test` — E2E tests pass
- [ ] `node packages/cli/dist/cli.js audit --root examples/basic` — score ≥ 85
- [ ] Contract tests: `pnpm --filter @mineproj/contract-tests test` — all pass
- [ ] Golden files: `UPDATE_GOLDEN=1 pnpm --filter @mineproj/contract-tests test` — updated if needed

## Legal & Branding

- [ ] LICENSE file is Apache-2.0 (full text)
- [ ] NOTICE file exists with required attributions
- [ ] No "Apache mineproj" branding — use "mineproj, an Apache-2.0 licensed project"
- [ ] All source files have Apache-2.0 header comment
- [ ] DCO: all commits signed (`git commit -s`)

## Documentation

- [ ] README.md is up-to-date with features and quick start
- [ ] THEMES.md and PLUGINS.md are current
- [ ] Docs site builds without errors: `cd docs && pnpm docs:build`
- [ ] Docs site passes audit: `node packages/cli/dist/cli.js audit --root docs/.vitepress/dist`

## Release

- [ ] CHANGELOG.md updated via changesets
- [ ] Version bumped in all packages (fixed mode)
- [ ] Tag created: `git tag v1.0.0`
- [ ] GitHub Release created with `.tar.gz` + `.asc` + `.sha512`
- [ ] Published to npm: `pnpm publish -r`
- [ ] Published with provenance: `--provenance` flag

## Post-release

- [ ] Verify npm package installs: `npx create-mineproj test-site && cd test-site && pnpm install && pnpm build`
- [ ] Verify docs site is deployed and accessible
- [ ] Verify CI badge on README shows passing
- [ ] Announce on GitHub Discussions