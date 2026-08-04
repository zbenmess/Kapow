/**
 * KAPOW — Tokens de design et d'interaction
 * =========================================
 *
 * PALETTE « Goûter d'orage » (miroir de tailwind.config.js)
 * Six teintes saturées mais chaudes — une par héros — sur fond crème.
 *
 *   roc    #4EAD6E  vert prairie      — Roc, la force
 *   zoum   #EF5D8E  rose framboise    — Zoum, la vitesse
 *   alto   #E8603D  corail            — Alto, le vol
 *   givro  #45A8DC  bleu glacier      — Givro, la glace
 *   volta  #F5B531  jaune miel        — Volta, la foudre
 *   mira   #8A6BC9  violet myrtille   — Mira, l'invisibilité
 *   braise #C9404F  rouge cerise      — Braise, le feu
 *   onda   #2FB4A8  vert lagon        — Onda, l'eau
 *
 *   creme  #FFF6E9  fond unique · encre #35365C traits et ombres
 *
 * SIGNATURE VISUELLE : « l'étoile Kapow » — un splash de bande dessinée à huit
 * lobes tout en courbes, qui éclate derrière chaque réussite. C'est
 * l'onomatopée des comics (KAPOW !) traduite en pur pictogramme : toute
 * l'énergie de la BD, sans une seule lettre.
 *
 * FORMES : très arrondies (radius ≥ 24 px), ombres portées douces,
 * jamais de bordure fine, jamais d'angle vif.
 */

/** Taille minimale d'une cible tactile (px) — un doigt de 3 ans couvre ~2 cm. */
export const TAP_MIN = 90

/** Espacement minimal entre deux cibles tactiles (px). */
export const GAP_MIN = 24

/** Durée du flip 3D des cartes du Memory (ms). */
export const FLIP_MS = 400

/** Délai avant retournement automatique de deux cartes différentes (ms). */
export const MISMATCH_MS = 1200

/** Rayon d'aimantation du drag & drop (px). */
export const MAGNET_RADIUS = 80

/** Taille minimale d'une zone de dépôt (px). */
export const DROP_ZONE_MIN = 160

/** Tolérance de sortie du chemin dans « La toile » (px écran). */
export const TRACE_TOLERANCE = 45

/** Pause d'observation dans « Qui s'est envolé ? » (ms). */
export const OBSERVE_MS = 3000

/** Durée de l'appui long ouvrant l'accès parent (ms). */
export const PARENT_HOLD_MS = 3000

export const COLORS = {
  roc: '#4EAD6E',
  zoum: '#EF5D8E',
  alto: '#E8603D',
  givro: '#45A8DC',
  volta: '#F5B531',
  mira: '#8A6BC9',
  braise: '#C9404F',
  onda: '#2FB4A8',
  creme: '#FFF6E9',
  encre: '#35365C',
  coquille: '#FFFDF7',
} as const
