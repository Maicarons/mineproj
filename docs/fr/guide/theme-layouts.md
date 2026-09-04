# Mises en Page et Emplacements du Thème

## Mises en Page

mineproj nécessite 7 mises en page principales. Chaque mise en page est un composant React qui reçoit `LayoutProps`.

### Mise en Page d'Accueil

La page d'accueil. Affiche les projets vedettes, les projets récents et les informations du profil.

### Mise en Page de Liste

Affiche une grille filtrée/triée de projets. Utilisée par la route `/projects/`.

### Mise en Page de Détail

La page individuelle du projet à `/projects/<slug>/`. Affiche les détails complets du projet, le contenu du corps, les captures d'écran, les vidéos, les PDFs et les démos jouables.

### Mise en Page de Tag

Liste les projets filtrés par un tag à `/tags/<tag>/`.

### Mise en Page de Collection

Liste les projets dans une collection. Fonctionne de manière similaire à la mise en page de tag.

### Mise en Page À Propos

La page à propos à `/about/`. Affiche les informations du profil.

### Mise en Page Non Trouvée

La page 404. Affichée lorsqu'une route ne correspond pas.

## Emplacements (Slots)

Les emplacements sont des points d'extensibilité où les plugins peuvent injecter des composants :

```ts
// Dans un plugin
export default definePlugin({
  name: 'mon-plugin',
  hooks: {
    setup: (ctx) => {
      ctx.registerSlot('header', MonComposantEnTete);
    },
  },
});
```

Les emplacements intégrés incluent généralement : `header`, `footer`, `sidebar`, `editor-shell`.

## Comportement de Repli

Si un thème ne fournit pas de mise en page, mineproj utilise la mise en page du thème par défaut et émet un avertissement. Cela garantit que le site se construit toujours, même avec un thème incomplet.

## Registre des Composants

Le registre des composants résout les composants dans cet ordre :
1. Composants du thème
2. Composants du plugin
3. Surcharges de l'utilisateur (le dernier gagne)

Les surcharges de composants inconnus déclenchent un avertissement.