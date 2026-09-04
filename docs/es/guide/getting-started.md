# Primeros Pasos

¡Bienvenido a mineproj! Esta guía te ayudará a crear tu primer sitio de portafolio de proyectos.

## Prerrequisitos

- **Node.js** 22 o superior
- **pnpm** 10 (instalar mediante `npm install -g pnpm`)

## Crear un Nuevo Sitio

La forma más rápida de empezar es con la herramienta de scaffolding:

```bash
npx create-mineproj my-portfolio
cd my-portfolio
pnpm dev
```

Abre `http://localhost:5173` en tu navegador para ver tu sitio.

## Estructura del Proyecto

```
my-portfolio/
├─ mineproj.config.ts      # Configuración del sitio
├─ data/
│  ├─ projects/             # Datos de proyectos (JSON + Markdown)
│  │  └─ my-project/
│  │     ├─ index.json      # Metadatos del proyecto
│  │     └─ body.md         # Contenido del cuerpo del proyecto
│  ├─ profile.json          # Tu perfil
│  └─ tags.json             # Definiciones de etiquetas
├─ public/                  # Activos estáticos (imágenes, PDFs, etc.)
└─ dist/                    # Salida de compilación (generada)
```

## Añadir un Proyecto

Crea un nuevo directorio dentro de `data/projects/`:

```bash
mineproj new my-project
```

Esto crea `data/projects/my-project/index.json` y `data/projects/my-project/body.md`. Edita el archivo JSON para establecer los metadatos del proyecto.

## Compilar para Producción

```bash
pnpm build
```

La salida se genera en `dist/`. Previsualízala localmente:

```bash
pnpm preview
```

## Próximos Pasos

- [Guía de Configuración](./configuration) — referencia completa de configuración
- [Modelo de Datos](./data-model) — comprende el esquema de proyectos
- [Desarrollo de Temas](./theme-development) — personaliza la apariencia
- [Desarrollo de Plugins](./plugin-development) — extiende la funcionalidad
- [Despliegue](./deploying) — despliega tu sitio en producción