# Tontine — gestion de groupes d'épargne rotative

Application Angular 18 (composants standalone, signaux) pour suivre des
tontines : cotisations, tour de rotation des bénéficiaires, et caisse
collectée à chaque cycle. Aucune API externe requise — les données sont
persistées dans le `localStorage` du navigateur, donc l'app se déploie comme
un simple site statique.

## Fonctionnalités

- **Tableau de bord** : groupes actifs, membres, montant collecté vs attendu
  sur le tour en cours, nombre de retards.
- **Roue de rotation** : visualisation circulaire du tour de chaque membre,
  avec le bénéficiaire du cycle mis en évidence.
- **Suivi des cotisations** : un clic pour marquer un membre comme ayant
  cotisé ou non, pour le cycle en cours.
- **Clôture de tour** : fait avancer le groupe au cycle suivant.
- **Création / modification de groupe** : nom, montant, fréquence
  (hebdomadaire ou mensuelle), devise, date de départ, liste des membres
  dans l'ordre de leur tour.

## Démarrer en local

Prérequis : Node.js 18+ et npm.

```bash
npm install
npm start
```

L'application est servie sur `http://localhost:4200`.

## Build de production

```bash
npm run build
```

Le résultat est généré dans `dist/tontine-digitale/browser` — un dossier de
fichiers statiques (HTML/CSS/JS) prêt à être déployé sur n'importe quel
hébergeur statique.

## Déploiement

### Vercel
```bash
npm i -g vercel
vercel --prod
```
Ou via l'interface Vercel : importer le dépôt, laisser la commande de build
par défaut (`npm run build`) et indiquer `dist/tontine-digitale/browser`
comme dossier de sortie.

### Netlify
- Commande de build : `npm run build`
- Dossier de publication : `dist/tontine-digitale/browser`

Un fichier `netlify.toml` est inclus pour que ces réglages soient détectés
automatiquement.

### GitHub Pages
```bash
npm run build
npx angular-cli-ghpages --dir=dist/tontine-digitale/browser
```

## Notes techniques

- Angular 18, composants standalone, signaux (`signal`, `computed`,
  `effect`) pour l'état — pas de NgRx, l'app est volontairement légère.
- `TontineService` (`src/app/services/tontine.service.ts`) centralise toute
  la logique métier (rotation, cotisations, statistiques) et persiste dans
  `localStorage`. Pour brancher une vraie API plus tard, c'est le seul
  fichier à remplacer.
- Design système propre au projet (voir `src/styles.scss`) : palette
  encre/or/vert inspirée du registre de cotisation et du billet FCFA,
  typographies Fraunces (titres) + IBM Plex Sans (interface).
- Le composant `RotationWheelComponent` dessine la roue en SVG pur à partir
  de la position (`ordre`) de chaque membre — aucune librairie graphique
  externe.
