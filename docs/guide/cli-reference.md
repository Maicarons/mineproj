# CLI Reference

The `mineproj` CLI provides all commands for building, developing, and managing your site.

## Usage

```bash
mineproj <command> [options]
```

## Commands

### `dev`

Start the development server.

```bash
mineproj dev [--port <n>] [--host <host>] [--open] [--editor]
```

### `build`

Build the static site.

```bash
mineproj build [--outDir <dir>]
```

### `preview`

Preview the built site.

```bash
mineproj preview [--port <n>] [--host <host>]
```

### `check`

Validate config and data files.

```bash
mineproj check [--i18n]
```

### `new <slug>`

Create a new project skeleton.

```bash
mineproj new my-project
```

### `audit`

Score the built site on SEO, AI, a11y, and performance.

```bash
mineproj audit [--fail-under <n>]
```

### `doctor`

Diagnose the environment, config, and project state.

```bash
mineproj doctor
```

### `info`

Show resolved config, theme, and plugin diagnostics.

```bash
mineproj info
```

### `theme:eject`

Copy the current theme to `.mineproj/theme/` for customization.

```bash
mineproj theme:eject
```

### `i18n:init <locale>`

Scaffold a new locale.

```bash
mineproj i18n:init en
```

### `i18n:extract`

Extract untranslated keys per locale.

```bash
mineproj i18n:extract
```

### `editor:export`

Export editor drafts as JSON patches.

```bash
mineproj editor:export
```

### `migrate`

Schema version migration and backup.

```bash
mineproj migrate
```

## Global Options

| Option | Description |
|--------|-------------|
| `--root <dir>` | Site root directory |
| `--config <path>` | Explicit config file path |
| `--outDir <dir>` | Override output directory |
| `--port <n>` | Dev/preview server port |
| `--host <host>` | Dev/preview server host |
| `--open` | Open browser after start |
| `--editor` | Enable visual editor (dev only) |
| `--fail-under <n>` | Minimum audit score (default 85) |
| `-h, --help` | Show help |
| `-v, --version` | Show version |