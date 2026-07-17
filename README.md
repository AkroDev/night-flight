# Night Fall

Un clone du jeu d'arcade **Blitz** en JavaScript vanilla, jouable directement dans le navigateur (HTML5 Canvas, sans dépendance ni étape de build).

Jouable en ligne sur [akrolabs.fr/games/night-fall](https://www.akrolabs.fr/games/night-fall/).

## Gameplay

Un avion traverse l'écran de gauche à droite puis de droite à gauche, en descendant un peu plus à chaque passage. Le but : larguer des bombes pour raser tous les immeubles avant que l'avion ne finisse par en percuter un.

- **Espace** ou **clic** : lâcher une bombe (ou démarrer une partie / relancer après une défaite)
- **10 niveaux**, de plus en plus difficiles : l'avion accélère et descend plus vite à chaque niveau, et le nombre de bombes disponibles par passage diminue (5 aux niveaux 1-2, 4 aux niveaux 3-4, 3 à partir du niveau 5)
- **3 vies**, perdues définitivement en cas de collision (pas de régénération entre les niveaux)
- Un **classement local** (top 10) enregistre les meilleurs scores dans le navigateur (`localStorage`)
- Interface **FR/EN**, langue détectée automatiquement depuis le navigateur

Clin d'œil au *Blitz* original : le niveau 1 reprend sa palette monochrome jaune/noir, avant que chaque niveau suivant adopte sa propre teinte.

## Stack technique

- HTML5 Canvas + JavaScript vanilla — aucune dépendance, aucun bundler
- Code organisé en modules ES natifs (`import`/`export`), directement supportés par le navigateur
- Son synthétisé à la volée via la Web Audio API (pas de fichiers audio)

## Lancer en local

Aucune installation nécessaire, il suffit de servir les fichiers statiques :

```sh
python3 -m http.server
```

puis ouvrir `http://localhost:8000`.

> Le lien "← Labs" en bas de l'écran pointe vers `akrolabs.fr` en dur : il ne fonctionnera qu'une fois déployé, pas en local.

## Déploiement

Déployé sur Vercel (`night-flight-eight.vercel.app`), et exposé sous `akrolabs.fr/games/night-fall/` via un rewrite configuré dans le repo `akrolabs` (`vercel.json`, dépôt privé).

## Structure du projet

```
.
├── index.html      # Page unique, canvas de jeu
├── style.css       # Mise en page + lien retour discret
├── game.js         # État du jeu, physique, rendu, collisions (module ES)
├── audio.js        # Sons synthétisés (Web Audio API)
├── i18n.js         # Traductions FR/EN + détection de langue
└── assets/
    └── plane.png
```
