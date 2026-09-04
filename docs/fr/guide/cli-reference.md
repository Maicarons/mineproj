# Référence CLI

La CLI `mineproj` fournit toutes les commandes pour construire, développer et gérer votre site.

## Utilisation

```bash
mineproj <commande> [options]
```

## Commandes

### `dev`

Démarre le serveur de développement.

```bash
mineproj dev [--port <n>] [--host <hôte>] [--open] [--editor]
```

### `build`

Construit le site statique.

```bash
mineproj build [--outDir <répertoire>]
```

### `preview`

Prévisualise le site construit.

```bash
mineproj preview [--port <n>] [--host <hôte>]
```

### `check`

Valide les fichiers de configuration et de données.

```bash
mineproj check [--i18n]
```

### `new <slug>`

Crée un nouveau squelette de projet.

```bash
mineproj new mon-projet
```

### `audit`

Évalue le site construit sur le SEO, l'IA, l'accessibilité et les performances.

```bash
mineproj audit [--fail-under <n>]
```

### `doctor`

Diagnostique l'environnement, la configuration et l'état du projet.

```bash
mineproj doctor
```

### `info`

Affiche les diagnostics résolus de la configuration, du thème et des plugins.

```bash
mineproj info
```

### `theme:eject`

Copie le thème actuel vers `.mineproj/theme/` pour personnalisation.

```bash
mineproj theme:eject
```

### `i18n:init <locale>`

Crée la structure pour une nouvelle locale.

```bash
mineproj i18n:init en
```

### `i18n:extract`

Extrait les clés non traduites par locale.

```bash
mineproj i18n:extract
```

### `editor:export`

Exporte les brouillons de l'éditeur sous forme de correctifs JSON.

```bash
mineproj editor:export
```

### `migrate`

Migration de version de schéma et sauvegarde.

```bash
mineproj migrate
```

## Options Globales

| Option | Description |
|--------|-------------|
| `--root <répertoire>` | Répertoire racine du site |
| `--config <chemin>` | Chemin explicite du fichier de configuration |
| `--outDir <répertoire>` | Remplace le répertoire de sortie |
| `--port <n>` | Port du serveur de développement/prévisualisation |
| `--host <hôte>` | Hôte du serveur de développement/prévisualisation |
| `--open` | Ouvre le navigateur après le démarrage |
| `--editor` | Active l'éditeur visuel (développement uniquement) |
| `--fail-under <n>` | Score d'audit minimum (défaut 85) |
| `-h, --help` | Affiche l'aide |
| `-v, --version` | Affiche la version |