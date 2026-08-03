# KAPOW — La Ligue des Héros

Progressive Web App de jeux éducatifs pour un enfant de **3 ans**, sur tablette
en mode paysage, **100 % hors ligne**. Aucun texte destiné à l'enfant, aucun
mécanisme d'échec, aucune sortie possible du jeu.

## L'univers : la Ligue Kapow

Six héros originaux, dessinés en SVG inline (vectoriel plat, formes rondes,
visages stylisés en deux points et un sourire — jamais réalistes) :

| Héros | Teinte | Emblème | Pouvoir |
|-------|--------|---------|---------|
| **Roc** | vert prairie `#4EAD6E` | poing arrondi | la force |
| **Zoum** | rose framboise `#EF5D8E` | comète | la vitesse |
| **Alto** | corail `#E8603D` | aile à trois plumes | le vol |
| **Givro** | bleu glacier `#45A8DC` | flocon | la glace |
| **Volta** | jaune miel `#F5B531` | éclair | la foudre |
| **Mira** | violet myrtille `#8A6BC9` | croissant de lune | l'invisibilité |

Chaque héros se reconnaît à trois signaux redondants — sa couleur, son emblème,
son petit motif sonore — pour qu'un enfant qui ne lit pas ne les confonde jamais.

## Système de tokens (« Goûter d'orage »)

Défini dans `tailwind.config.js` et `src/design/tokens.ts` :

- **Palette** : les 6 teintes des héros + fond crème `#FFF6E9`, encre `#35365C`,
  coquille `#FFFDF7`. Saturée mais chaude — pas de dégradé bleu-violet, pas de blanc froid.
- **Police** : Baloo 2 (variable, auto-hébergée dans `public/fonts/`) — interface
  **parent uniquement**, l'enfant ne voit jamais un mot.
- **Formes** : radius ≥ 24 px (`rounded-3xl`, `rounded-blob`), ombres portées
  douces (`shadow-pose`, `shadow-flottant`), jamais de bordure fine ni d'angle vif.
- **Interaction** : cible tactile ≥ 90 × 90 px, espacement ≥ 24 px, aimantation
  80 px, zones de dépôt ≥ 160 px, tolérance de tracé 45 px — toutes ces
  constantes vivent dans `src/design/tokens.ts`.

**Signature visuelle : l'étoile Kapow** — un splash de bande dessinée à huit
lobes tout en courbes qui éclate derrière chaque réussite. C'est l'onomatopée
des comics (KAPOW !) traduite en pur pictogramme : toute l'énergie de la BD,
sans une seule lettre.

## Les 4 jeux

1. **Memory des emblèmes** — 3 paires (2×3) → 4 paires (2×4) → 6 paires (3×4).
   Flip 3D 400 ms ; paire trouvée = grossissement + son du héros ; deux cartes
   différentes = retournement silencieux après 1,2 s.
2. **Qui s'est envolé ?** — « Regarde bien », 3 s d'observation, un héros
   s'envole, deux vignettes très espacées ; le bon choix le fait revenir en volant.
   Mauvaise vignette : rebond doux, rien d'autre, réessai illimité.
3. **Chaque héros son bouclier** — drag & drop avec inertie (ressort), aimantation
   à 80 px, zones de 160 px ; relâché ailleurs, le héros revient à sa place.
4. **La toile** — tracé au doigt (droite → courbe → zigzag), tolérance 45 px ;
   sortie du chemin = le trait s'arrête, on reprend au dernier point valide.

## Garanties (les trois interdits)

- **Zéro texte enfant** : les seules lettres de l'app sont dans l'espace parent
  (verrouillé par appui long de 3 s + addition à deux chiffres).
- **Zéro échec** : pas de chrono, pas de score, pas de vies, pas de son négatif,
  pas d'écran « perdu ». Une action ratée ne déclenche rien (Memory, Toile) ou
  un simple rebond doux (Envol).
- **Zéro sortie** : aucun lien externe, aucune pub, aucun achat, aucune requête
  réseau après installation. `localStorage` uniquement.

Verrouillages techniques : Pointer Events exclusivement (`setPointerCapture`
pour les drags), `touch-action: none` sur les zones de jeu, `user-select: none`
et `-webkit-touch-callout: none` globaux, `overscroll-behavior: none`
(pull-to-refresh), viewport non zoomable, entrées verrouillées pendant les
animations, `prefers-reduced-motion` → fondus simples.

## Développement

```bash
npm install
npm run dev       # développement
npm run build     # build de production + PWA (dist/)
npm run preview   # tester le build (nécessaire pour le service worker)
```

## Fichiers audio à produire

Tous les effets sonores sont synthétisés par oscillateur Web Audio (aucun
fichier nécessaire). Les **voix off** sont à enregistrer et à déposer dans
`public/voice/` au format mp3 (voix chaleureuse, débit lent, phrases courtes).
Tant qu'un fichier manque, un carillon doux à deux notes sert de placeholder.

| Fichier | Texte à enregistrer |
|---------|--------------------|
| `voice/accueil.mp3` | « Bienvenue dans la Ligue Kapow ! Choisis ton jeu. » |
| `voice/regarde-bien.mp3` | « Regarde bien… » |
| `voice/bravo.mp3` | « Bravo ! » |
| `voice/memory-intro.mp3` | « Retrouve les paires d'emblèmes ! Touche une carte. » |
| `voice/envol-intro.mp3` | « Qui s'est envolé ? » |
| `voice/boucliers-intro.mp3` | « Donne à chaque héros son bouclier ! » |
| `voice/toile-intro.mp3` | « Suis le chemin avec ton doigt, du gros point jusqu'au bout ! » |
| `voice/nom-roc.mp3` | « Roc ! » |
| `voice/nom-zoum.mp3` | « Zoum ! » |
| `voice/nom-alto.mp3` | « Alto ! » |
| `voice/nom-givro.mp3` | « Givro ! » |
| `voice/nom-volta.mp3` | « Volta ! » |
| `voice/nom-mira.mp3` | « Mira ! » |

Après ajout des mp3, relancer `npm run build` : le service worker les précache
et ils fonctionnent hors ligne.

## Structure

```
src/
  games/          un dossier par jeu, autonome (memory, envol, boucliers, toile)
  components/     Hero, Shield, TileButton, BackButton, KapowBurst
  characters/     définitions et SVG des 6 héros
  audio/          AudioManager (Web Audio) + hook useSound
  store/          état Zustand (progression, réglages, volume) → localStorage
  parent/         ParentGate (appui long + addition) et ParentPanel
  design/         tokens documentés
  App.tsx
```
