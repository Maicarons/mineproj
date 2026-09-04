# Modelo de Datos

mineproj utiliza un modelo de datos simple basado en archivos. Todo el contenido se almacena como archivos JSON + Markdown en el directorio `data/`.

## Proyecto

Cada proyecto reside en `data/projects/<slug>/index.json`:

```json
{
  "slug": "my-project",
  "name": "Mi Proyecto",
  "tagline": "Una descripción breve y llamativa",
  "summary": "Un resumen más extenso para tarjetas, SEO y feeds (se recomiendan 160+ caracteres)",
  "description": "Descripción opcional en Markdown (alternativa a bodyFile)",
  "bodyFile": "body.md",
  "cover": "cover.png",
  "icon": "icon.svg",
  "category": "web",
  "tags": ["web", "tool"],
  "status": "released",
  "createdAt": "2026-01-15T00:00:00.000Z",
  "updatedAt": "2026-03-01T00:00:00.000Z",
  "releasedAt": "2026-02-01T00:00:00.000Z",
  "license": "MIT",
  "role": "Creador y Desarrollador",
  "links": [
    { "url": "https://github.com/me/my-project", "type": "repo" },
    { "url": "https://my-project.example.com", "type": "homepage" },
    { "url": "https://npmjs.com/package/my-project", "type": "npm" }
  ],
  "techStack": ["TypeScript", "React", "Node.js"],
  "platforms": ["web", "linux", "macos", "windows"],
  "languages": ["en", "zh-CN"],
  "highlights": ["Primera funcionalidad", "Segunda funcionalidad"],
  "screenshots": [
    { "src": "screenshot-1.png", "alt": "Vista principal" }
  ],
  "videos": [
    { "src": "demo.mp4", "type": "video/mp4", "poster": "poster.png" }
  ],
  "docs": [
    { "file": "manual.pdf", "title": "Manual de Usuario", "type": "pdf" }
  ],
  "playable": {
    "type": "iframe",
    "entry": "/demos/my-project/",
    "sandbox": "allow-scripts allow-forms"
  },
  "seo": {
    "description": "Descripción SEO personalizada",
    "ogImage": "og-custom.png",
    "noindex": false
  },
  "faq": [
    { "q": "¿Qué es esto?", "a": "Un proyecto." }
  ],
  "changelog": [
    { "version": "1.0.0", "date": "2026-02-01", "notes": "Versión inicial" }
  ],
  "featured": true,
  "weight": 10,
  "hidden": false,
  "accentColor": "#ff6600",
  "i18n": {
    "en": {
      "name": "Mi Proyecto (Inglés)",
      "tagline": "Eslogan en inglés",
      "summary": "Resumen en inglés",
      "description": "Descripción en inglés"
    }
  }
}
```

## Perfil

`data/profile.json`:

```json
{
  "name": "Tu Nombre",
  "avatar": "avatar.png",
  "bio": "Una biografía corta",
  "url": "https://example.com",
  "email": "hello@example.com",
  "location": "Ciudad, País",
  "social": {
    "github": "tu-usuario-de-github",
    "twitter": "@tu-usuario"
  }
}
```

## Etiquetas

`data/tags.json` (opcional):

```json
{
  "web": { "label": "Web", "description": "Proyectos web" },
  "cli": { "label": "CLI", "description": "Herramientas de línea de comandos" }
}
```

## Colecciones

Los proyectos se pueden organizar en colecciones. Una colección se define agrupando proyectos con la misma etiqueta. La ruta `tags/galley/` lista automáticamente todos los proyectos con una etiqueta determinada.

## Sobrescrituras i18n

Para cada idioma adicional al predeterminado, crea `index.<locale>.json`:

```json
{
  "name": "Nombre Traducido",
  "tagline": "Eslogan traducido",
  "bodyFile": "body.en.md"
}
```

O define sobrescrituras en línea en el campo `i18n` del archivo `index.json` principal.