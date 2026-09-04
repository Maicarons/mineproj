# Pour Commencer

Bienvenue sur mineproj ! Ce guide vous aidera à créer votre premier site portfolio de projet.

## Prerequis

- **Node.js** 22 ou version ultérieure
- **pnpm** 10 (installez via `npm install -g pnpm`)

## Creer un Nouveau Site

La façon la plus rapide de démarrer est d'utiliser l'outil d'échafaudage :

```bash
npx create-mineproj mon-portfolio
cd mon-portfolio
pnpm dev
```

Ouvrez `http://localhost:5173` dans votre navigateur pour voir votre site.

## Structure du Projet

```
mon-portfolio/
├─ mineproj.config.ts      # Configuration du site
├─ data/
│  ├─ projects/             # Données des projets (JSON + Markdown)
│  │  └─ mon-projet/
│  │     ├─ index.json      # Métadonnées du projet
│  │     └─ body.md         # Contenu du corps du projet
│  ├─ profile.json          # Votre profil
│  └─ tags.json             # Définitions des tags
├─ public/                  # Ressources statiques (images, PDFs, etc.)
└─ dist/                    # Sortie de construction (générée)
```

## Ajouter un Projet

Créez un nouveau répertoire sous `data/projects/` :

```bash
mineproj new mon-projet
```

Cela crée `data/projects/mon-projet/index.json` et `data/projects/mon-projet/body.md`. Modifiez le fichier JSON pour définir les métadonnées du projet.

## Construire pour la Production

```bash
pnpm build
```

La sortie est placée dans `dist/`. Prévisualisez-la localement :

```bash
pnpm preview
```

## Prochaines Etapes

- [Guide de Configuration](./configuration) — référence complète de la configuration
- [Modèle de Données](./data-model) — comprendre le schéma de projet
- [Développement de Thème](./theme-development) — personnaliser l'apparence
- [Développement de Plugin](./plugin-development) — étendre les fonctionnalités
- [Déploiement](./deploying) — déployer votre site en production