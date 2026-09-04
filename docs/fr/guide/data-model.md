# Modèle de Données

mineproj utilise un modèle de données simple basé sur des fichiers. Tout le contenu est stocké sous forme de fichiers JSON + Markdown dans le répertoire `data/`.

## Projet

Chaque projet réside dans `data/projects/<slug>/index.json` :

```json
{
  "slug": "mon-projet",
  "name": "Mon Projet",
  "tagline": "Une description courte et percutante",
  "summary": "Un résumé plus long pour les cartes, le SEO et les flux (160+ caractères recommandé)",
  "description": "Description Markdown en ligne optionnelle (alternative à bodyFile)",
  "bodyFile": "body.md",
  "cover": "cover.png",
  "icon": "icon.svg",
  "category": "web",
  "tags": ["web", "outil"],
  "status": "released",
  "createdAt": "2026-01-15T00:00:00.000Z",
  "updatedAt": "2026-03-01T00:00:00.000Z",
  "releasedAt": "2026-02-01T00:00:00.000Z",
  "license": "MIT",
  "role": "Createur & Developpeur",
  "links": [
    { "url": "https://github.com/me/mon-projet", "type": "repo" },
    { "url": "https://mon-projet.example.com", "type": "homepage" },
    { "url": "https://npmjs.com/package/mon-projet", "type": "npm" }
  ],
  "techStack": ["TypeScript", "React", "Node.js"],
  "platforms": ["web", "linux", "macos", "windows"],
  "languages": ["en", "zh-CN"],
  "highlights": ["Premiere fonctionnalite", "Deuxieme fonctionnalite"],
  "screenshots": [
    { "src": "capture-1.png", "alt": "Vue principale" }
  ],
  "videos": [
    { "src": "demo.mp4", "type": "video/mp4", "poster": "affiche.png" }
  ],
  "docs": [
    { "file": "manuel.pdf", "title": "Manuel d'Utilisation", "type": "pdf" }
  ],
  "playable": {
    "type": "iframe",
    "entry": "/demos/mon-projet/",
    "sandbox": "allow-scripts allow-forms"
  },
  "seo": {
    "description": "Description SEO personnalisee",
    "ogImage": "og-personnalisee.png",
    "noindex": false
  },
  "faq": [
    { "q": "Qu'est-ce que c'est ?", "a": "Un projet." }
  ],
  "changelog": [
    { "version": "1.0.0", "date": "2026-02-01", "notes": "Version initiale" }
  ],
  "featured": true,
  "weight": 10,
  "hidden": false,
  "accentColor": "#ff6600",
  "i18n": {
    "en": {
      "name": "Mon Projet (Anglais)",
      "tagline": "Slogan en anglais",
      "summary": "Resume en anglais",
      "description": "Description en anglais"
    }
  }
}
```

## Profil

`data/profile.json` :

```json
{
  "name": "Votre Nom",
  "avatar": "avatar.png",
  "bio": "Une courte biographie",
  "url": "https://example.com",
  "email": "bonjour@example.com",
  "location": "Ville, Pays",
  "social": {
    "github": "votre-identifiant-github",
    "twitter": "@votre-identifiant"
  }
}
```

## Tags

`data/tags.json` (optionnel) :

```json
{
  "web": { "label": "Web", "description": "Projets web" },
  "cli": { "label": "CLI", "description": "Outils en ligne de commande" }
}
```

## Collections

Les projets peuvent être organisés en collections. Une collection est définie en regroupant les projets avec le même tag. La route `tags/galley/` liste automatiquement tous les projets avec un tag donné.

## Surcharges i18n

Pour chaque locale au-delà de la locale par défaut, créez `index.<locale>.json` :

```json
{
  "name": "Nom Traduit",
  "tagline": "Slogan traduit",
  "bodyFile": "body.en.md"
}
```

Ou définissez des surcharges en ligne dans le champ `i18n` du fichier `index.json` principal.