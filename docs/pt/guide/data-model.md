# Modelo de Dados

O mineproj usa um modelo de dados simples baseado em arquivos. Todo o conteúdo é armazenado como arquivos JSON + Markdown no diretório `data/`.

## Projeto

Cada projeto reside em `data/projects/<slug>/index.json`:

```json
{
  "slug": "meu-projeto",
  "name": "Meu Projeto",
  "tagline": "Uma descrição curta e impactante",
  "summary": "Um resumo mais longo para cards, SEO e feeds (160+ caracteres recomendado)",
  "description": "Descrição Markdown inline opcional (alternativa ao bodyFile)",
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
  "role": "Criador & Desenvolvedor",
  "links": [
    { "url": "https://github.com/me/meu-projeto", "type": "repo" },
    { "url": "https://meu-projeto.example.com", "type": "homepage" },
    { "url": "https://npmjs.com/package/meu-projeto", "type": "npm" }
  ],
  "techStack": ["TypeScript", "React", "Node.js"],
  "platforms": ["web", "linux", "macos", "windows"],
  "languages": ["en", "zh-CN"],
  "highlights": ["Primeira funcionalidade", "Segunda funcionalidade"],
  "screenshots": [
    { "src": "screenshot-1.png", "alt": "Visão principal" }
  ],
  "videos": [
    { "src": "demo.mp4", "type": "video/mp4", "poster": "poster.png" }
  ],
  "docs": [
    { "file": "manual.pdf", "title": "Manual do Usuário", "type": "pdf" }
  ],
  "playable": {
    "type": "iframe",
    "entry": "/demos/meu-projeto/",
    "sandbox": "allow-scripts allow-forms"
  },
  "seo": {
    "description": "Descrição SEO personalizada",
    "ogImage": "og-custom.png",
    "noindex": false
  },
  "faq": [
    { "q": "O que é isso?", "a": "Um projeto." }
  ],
  "changelog": [
    { "version": "1.0.0", "date": "2026-02-01", "notes": "Lançamento inicial" }
  ],
  "featured": true,
  "weight": 10,
  "hidden": false,
  "accentColor": "#ff6600",
  "i18n": {
    "en": {
      "name": "Meu Projeto (Inglês)",
      "tagline": "Slogan em inglês",
      "summary": "Resumo em inglês",
      "description": "Descrição em inglês"
    }
  }
}
```

## Perfil

`data/profile.json`:

```json
{
  "name": "Seu Nome",
  "avatar": "avatar.png",
  "bio": "Uma biografia curta",
  "url": "https://example.com",
  "email": "hello@example.com",
  "location": "Cidade, País",
  "social": {
    "github": "seu-usuario-github",
    "twitter": "@seu-usuario"
  }
}
```

## Tags

`data/tags.json` (opcional):

```json
{
  "web": { "label": "Web", "description": "Projetos web" },
  "cli": { "label": "CLI", "description": "Ferramentas de linha de comando" }
}
```

## Coleções

Projetos podem ser organizados em coleções. Uma coleção é definida agrupando projetos com a mesma tag. A rota `tags/galeria/` lista automaticamente todos os projetos com uma determinada tag.

## Sobrescritas de i18n

Para cada localidade além da padrão, crie `index.<locale>.json`:

```json
{
  "name": "Nome Traduzido",
  "tagline": "Slogan traduzido",
  "bodyFile": "body.en.md"
}
```

Ou defina sobrescritas inline no campo `i18n` do `index.json` principal.