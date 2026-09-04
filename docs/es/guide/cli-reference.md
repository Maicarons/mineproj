# Referencia de CLI

La CLI de `mineproj` proporciona todos los comandos para compilar, desarrollar y gestionar tu sitio.

## Uso

```bash
mineproj <comando> [opciones]
```

## Comandos

### `dev`

Inicia el servidor de desarrollo.

```bash
mineproj dev [--port <n>] [--host <host>] [--open] [--editor]
```

### `build`

Compila el sitio estático.

```bash
mineproj build [--outDir <dir>]
```

### `preview`

Previsualiza el sitio compilado.

```bash
mineproj preview [--port <n>] [--host <host>]
```

### `check`

Valida la configuración y los archivos de datos.

```bash
mineproj check [--i18n]
```

### `new <slug>`

Crea un nuevo esqueleto de proyecto.

```bash
mineproj new my-project
```

### `audit`

Evalúa el sitio compilado en SEO, IA, accesibilidad y rendimiento.

```bash
mineproj audit [--fail-under <n>]
```

### `doctor`

Diagnostica el entorno, la configuración y el estado del proyecto.

```bash
mineproj doctor
```

### `info`

Muestra la configuración resuelta, el tema y los diagnósticos de plugins.

```bash
mineproj info
```

### `theme:eject`

Copia el tema actual a `.mineproj/theme/` para personalización.

```bash
mineproj theme:eject
```

### `i18n:init <locale>`

Crea la estructura para un nuevo idioma.

```bash
mineproj i18n:init en
```

### `i18n:extract`

Extrae las claves no traducidas por idioma.

```bash
mineproj i18n:extract
```

### `editor:export`

Exporta borradores del editor como parches JSON.

```bash
mineproj editor:export
```

### `migrate`

Migración de versión de esquema y copia de seguridad.

```bash
mineproj migrate
```

## Opciones Globales

| Opción | Descripción |
|--------|-------------|
| `--root <dir>` | Directorio raíz del sitio |
| `--config <path>` | Ruta explícita del archivo de configuración |
| `--outDir <dir>` | Sobrescribe el directorio de salida |
| `--port <n>` | Puerto del servidor de desarrollo/previsualización |
| `--host <host>` | Host del servidor de desarrollo/ previsualización |
| `--open` | Abre el navegador después de iniciar |
| `--editor` | Habilita el editor visual (solo desarrollo) |
| `--fail-under <n>` | Puntuación mínima de auditoría (por defecto 85) |
| `-h, --help` | Muestra la ayuda |
| `-v, --version` | Muestra la versión |