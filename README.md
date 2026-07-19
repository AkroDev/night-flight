# Night Fall

*(ou : comment détruire dix villes fictives sans jamais avoir à répondre à un maire en colère)*

Un clone du jeu d'arcade **Blitz**, en JavaScript vanilla — parce que parfois, pour apprendre les fondamentaux du Canvas, il faut bien larguer quelques bombes sur des immeubles imaginaires.

Jouable en ligne sur [akrolabs.fr/games/night-fall](https://www.akrolabs.fr/games/night-fall/) — aucun permis de démolir requis.

## Le pitch

Vous incarnez **Rick Vonder Molisch**, inspecteur urbanisme volant, envoyé en mission pour "redévelopper" dix villes qui ne le méritaient probablement pas — de Pétaouchnok-sur-Mer (moins intéressante qu'un rond-point en zone industrielle) à Nougatville-Capitale (le boss final, où tout colle, y compris la sortie). Personne ne vous a donné d'autorisation. Tant pis.

## Gameplay

Un avion traverse l'écran de gauche à droite puis de droite à gauche, en descendant un peu plus à chaque passage — comme s'il cherchait la sortie sans oser le demander. Le but : raser tous les immeubles avant que l'avion ne finisse par en percuter un (ce qui arrivera, probablement plus tôt que prévu).

- **Espace** ou **clic** : lâcher une bombe (ou démarrer une partie / relancer après une défaite — même bouton, on ne juge pas)
- **Tab** : consulter le classement, si vous avez le courage
- **10 niveaux**, de plus en plus hostiles : l'avion accélère, descend plus vite, et le nombre de bombes disponibles fond comme neige au soleil (5 aux niveaux 1-2, 4 aux niveaux 3-4, 3 à partir du niveau 5 — débrouillez-vous)
- **3 vies**, perdues définitivement en cas de collision. Aucune assurance ne couvre ça.
- Un **classement local** (top 10) enregistre vos exploits dans le navigateur — 3 lettres seulement, comme à l'époque où on n'avait pas de quoi taper son nom en entier
- Interface **FR/EN**, langue détectée automatiquement — l'humour, lui, ne se traduit pas toujours littéralement

Clin d'œil au *Blitz* original : le niveau 1 reprend sa palette monochrome jaune/noir, avant que chaque niveau suivant se trouve sa propre couleur — un peu comme un ado qui découvre les néons.

## Stack technique

*(ici, on redevient sérieux deux minutes)*

- HTML5 Canvas + JavaScript vanilla — aucune dépendance, aucun bundler, aucune excuse
- Code organisé en modules ES natifs (`import`/`export`), directement supportés par le navigateur
- Son synthétisé à la volée via la Web Audio API (pas de fichier audio — même le "boom" est fait maison)

## Lancer en local

Aucune installation nécessaire, il suffit de servir les fichiers statiques :

```sh
python3 -m http.server
```

puis ouvrir `http://localhost:8000`.

> Le lien "← Labs" en bas de l'écran pointe vers `akrolabs.fr` en dur : il ne fonctionnera qu'une fois déployé, pas en local. Chez vous, il ne mène nulle part — un peu comme Pétaouchnok-sur-Mer.

## Déploiement

Déployé sur Vercel (`night-flight-eight.vercel.app`), et exposé sous `akrolabs.fr/games/night-fall/` via un rewrite configuré dans le repo `akrolabs` (`vercel.json`, dépôt privé).

## Structure du projet

```
.
├── index.html      # Page unique, canvas de jeu
├── style.css       # Mise en page + lien retour discret
├── game.js         # État du jeu, physique, rendu, collisions (module ES)
├── audio.js        # Sons synthétisés (Web Audio API)
├── i18n.js         # Traductions FR/EN, missions et mauvais jeux de mots inclus
└── assets/
    └── plane.png   # Vestige de l'époque où l'avion était une image plutôt que du code
```
