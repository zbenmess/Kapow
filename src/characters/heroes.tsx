/**
 * La Ligue Kapow — six héros originaux.
 *
 * Chaque héros = une teinte identifiable + une forme d'emblème + un pouvoir
 * lisible par un enfant de 3 ans. Dessin vectoriel plat, formes rondes,
 * visages stylisés (deux points, un sourire) — jamais réalistes.
 *
 *   Roc    · vert prairie   · poing      · la force
 *   Zoum   · rose framboise · comète     · la vitesse
 *   Alto   · corail         · aile       · le vol
 *   Givro  · bleu glacier   · flocon     · la glace
 *   Volta  · jaune miel     · éclair     · la foudre
 *   Mira   · violet myrtille· croissant  · l'invisibilité
 *   Braise · rouge cerise   · flamme     · le feu
 *   Onda   · vert lagon     · vague      · l'eau
 */

export type HeroId = 'roc' | 'zoum' | 'alto' | 'givro' | 'volta' | 'mira' | 'braise' | 'onda'

export interface HeroDef {
  id: HeroId
  /** Prénom — utilisé uniquement dans l'interface parent et la voix off. */
  name: string
  power: string
  color: string
  colorDark: string
}

export const HEROES: Record<HeroId, HeroDef> = {
  roc: { id: 'roc', name: 'Roc', power: 'la force', color: '#4EAD6E', colorDark: '#2F7A49' },
  zoum: { id: 'zoum', name: 'Zoum', power: 'la vitesse', color: '#EF5D8E', colorDark: '#C23A6B' },
  alto: { id: 'alto', name: 'Alto', power: 'le vol', color: '#E8603D', colorDark: '#B8432A' },
  givro: { id: 'givro', name: 'Givro', power: 'la glace', color: '#45A8DC', colorDark: '#2C7FAD' },
  volta: { id: 'volta', name: 'Volta', power: 'la foudre', color: '#F5B531', colorDark: '#C98D1B' },
  mira: { id: 'mira', name: 'Mira', power: "l'invisibilité", color: '#8A6BC9', colorDark: '#64489E' },
  braise: { id: 'braise', name: 'Braise', power: 'le feu', color: '#C9404F', colorDark: '#962B3A' },
  onda: { id: 'onda', name: 'Onda', power: "l'eau", color: '#2FB4A8', colorDark: '#1E837B' },
}

export const HERO_IDS: HeroId[] = ['roc', 'zoum', 'alto', 'givro', 'volta', 'mira', 'braise', 'onda']

/* ------------------------------------------------------------------ */
/* Emblèmes — glyphes pleins, viewBox 0 0 100 100, dessinés en `fill`. */
/* ------------------------------------------------------------------ */

function EmblemRoc({ fill }: { fill: string }) {
  // Poing arrondi : quatre phalanges rondes sur une paume capsule.
  return (
    <g fill={fill}>
      <rect x="22" y="34" width="56" height="44" rx="18" />
      <circle cx="31" cy="34" r="9" />
      <circle cx="44" cy="30" r="9" />
      <circle cx="57" cy="30" r="9" />
      <circle cx="70" cy="34" r="9" />
      <rect x="14" y="46" width="18" height="26" rx="9" />
    </g>
  )
}

function EmblemZoum({ fill }: { fill: string }) {
  // Comète : une tête ronde, deux traînées de vitesse.
  return (
    <g fill={fill}>
      <circle cx="64" cy="38" r="21" />
      <rect x="12" y="50" width="40" height="12" rx="6" transform="rotate(-12 32 56)" />
      <rect x="20" y="68" width="34" height="12" rx="6" transform="rotate(-12 37 74)" />
    </g>
  )
}

function EmblemAlto({ fill }: { fill: string }) {
  // Aile : trois plumes capsules en éventail.
  return (
    <g fill={fill}>
      <rect x="18" y="44" width="64" height="17" rx="8.5" transform="rotate(-32 50 52)" />
      <rect x="22" y="60" width="52" height="16" rx="8" transform="rotate(-18 48 68)" />
      <rect x="28" y="74" width="38" height="15" rx="7.5" transform="rotate(-6 47 81)" />
    </g>
  )
}

function EmblemGivro({ fill }: { fill: string }) {
  // Flocon : six branches arrondies autour d'un cœur rond.
  return (
    <g fill={fill}>
      {[0, 60, 120].map((a) => (
        <rect key={a} x="44" y="8" width="12" height="84" rx="6" transform={`rotate(${a} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="13" />
    </g>
  )
}

function EmblemVolta({ fill }: { fill: string }) {
  // Éclair aux angles adoucis.
  return (
    <path
      d="M57 6 L26 54 L44 54 L38 94 L75 40 L54 40 Z"
      fill={fill}
      stroke={fill}
      strokeWidth="10"
      strokeLinejoin="round"
    />
  )
}

function EmblemMira({ fill }: { fill: string }) {
  // Croissant de lune : ce qu'on voit encore de celle qui disparaît.
  return (
    <path
      d="M 77 17.8 A 42 42 0 1 0 77 82.2 A 34 34 0 1 1 77 17.8 Z"
      transform="translate(6 0)"
      fill={fill}
    />
  )
}

function EmblemBraise({ fill }: { fill: string }) {
  // Flamme : une mèche qui danse sur le côté.
  return (
    <path
      d="M50 6 C46 26 68 32 70 56 A26 26 0 1 1 24 62 C24 46 34 40 36 26 C42 36 48 30 50 6 Z"
      fill={fill}
    />
  )
}

function EmblemOnda({ fill }: { fill: string }) {
  // Double vague : l'eau qui roule.
  return (
    <g stroke={fill} strokeWidth="11" fill="none" strokeLinecap="round">
      <path d="M14 38 Q30 24 50 38 T86 38" />
      <path d="M14 62 Q30 48 50 62 T86 62" />
    </g>
  )
}

const EMBLEMS: Record<HeroId, (p: { fill: string }) => JSX.Element> = {
  roc: EmblemRoc,
  zoum: EmblemZoum,
  alto: EmblemAlto,
  givro: EmblemGivro,
  volta: EmblemVolta,
  mira: EmblemMira,
  braise: EmblemBraise,
  onda: EmblemOnda,
}

/** Glyphe d'emblème seul (à poser sur un fond de couleur). */
export function Emblem({ hero, fill = '#FFFDF7' }: { hero: HeroId; fill?: string }) {
  const Glyph = EMBLEMS[hero]
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <Glyph fill={fill} />
    </svg>
  )
}

/** Emblème sur pastille ronde de la couleur du héros. */
export function EmblemBadge({ hero }: { hero: HeroId }) {
  const def = HEROES[hero]
  const Glyph = EMBLEMS[hero]
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill={def.color} />
      <g transform="translate(50 50) scale(0.62) translate(-50 -50)">
        <Glyph fill="#FFFDF7" />
      </g>
    </svg>
  )
}

/* --------------------------------------------------------------- */
/* Figures — silhouettes rondes et plates, viewBox 0 0 200 240.    */
/* --------------------------------------------------------------- */

/** Détails propres à chaque héros, dessinés derrière ou devant le corps. */
function HeroExtras({ def }: { def: HeroDef }) {
  switch (def.id) {
    case 'roc':
      // Épaules massives.
      return (
        <g fill={def.color}>
          <circle cx="38" cy="128" r="26" />
          <circle cx="162" cy="128" r="26" />
        </g>
      )
    case 'zoum':
      // Traînées de vitesse dans le dos.
      return (
        <g fill={def.colorDark} opacity="0.55">
          <rect x="6" y="112" width="52" height="13" rx="6.5" />
          <rect x="14" y="136" width="44" height="13" rx="6.5" />
          <rect x="6" y="160" width="36" height="13" rx="6.5" />
        </g>
      )
    case 'alto':
      // Deux petites ailes rondes.
      return (
        <g fill={def.colorDark}>
          <ellipse cx="34" cy="130" rx="26" ry="15" transform="rotate(-28 34 130)" />
          <ellipse cx="166" cy="130" rx="26" ry="15" transform="rotate(28 166 130)" />
        </g>
      )
    case 'givro':
      // Cristaux de glace sur la tête.
      return (
        <g fill={def.colorDark}>
          <rect x="70" y="6" width="14" height="34" rx="7" transform="rotate(-18 77 23)" />
          <rect x="93" y="0" width="14" height="40" rx="7" />
          <rect x="116" y="6" width="14" height="34" rx="7" transform="rotate(18 123 23)" />
        </g>
      )
    case 'volta':
      // Deux antennes en zigzag.
      return (
        <g stroke={def.colorDark} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M70 26 L60 10 L50 20" />
          <path d="M130 26 L140 10 L150 20" />
        </g>
      )
    case 'mira':
      // Halo en pointillés : elle est à moitié là.
      return (
        <circle
          cx="100"
          cy="120"
          r="94"
          fill="none"
          stroke={def.color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="1 22"
          opacity="0.8"
        />
      )
    case 'braise':
      // Trois flammèches sur la tête.
      return (
        <g fill={def.colorDark}>
          <path d="M78 28 C74 16 82 10 84 2 C90 10 90 20 86 30 Z" />
          <path d="M96 24 C92 10 100 4 102 -6 C110 4 110 16 104 28 Z" transform="translate(0 8)" />
          <path d="M116 28 C112 16 120 10 122 2 C128 10 128 20 124 30 Z" />
        </g>
      )
    case 'onda':
      // Trois bulles qui remontent le long de l'épaule.
      return (
        <g fill={def.colorDark} opacity="0.75">
          <circle cx="34" cy="150" r="10" />
          <circle cx="24" cy="120" r="7" />
          <circle cx="34" cy="94" r="5" />
        </g>
      )
  }
}

/**
 * Figure complète d'un héros : tête ronde, corps capsule, masque, sourire,
 * emblème sur le ventre. `ghost` rend Mira semi-transparente (invisibilité).
 */
export function HeroFigure({ hero, ghost = false }: { hero: HeroId; ghost?: boolean }) {
  const def = HEROES[hero]
  const Glyph = EMBLEMS[hero]
  const bodyOpacity = ghost ? 0.45 : 1
  return (
    <svg viewBox="0 0 200 240" width="100%" height="100%" aria-hidden="true">
      <HeroExtras def={def} />
      <g opacity={bodyOpacity}>
        {/* Corps capsule */}
        <rect x="48" y="96" width="104" height="118" rx="52" fill={def.color} />
        {/* Pieds */}
        <circle cx="78" cy="218" r="16" fill={def.colorDark} />
        <circle cx="122" cy="218" r="16" fill={def.colorDark} />
        {/* Tête */}
        <circle cx="100" cy="66" r="52" fill={def.color} />
        {/* Masque bandeau */}
        <rect x="52" y="46" width="96" height="34" rx="17" fill={def.colorDark} />
        {/* Yeux : deux points blancs */}
        <circle cx="82" cy="63" r="9" fill="#FFFDF7" />
        <circle cx="118" cy="63" r="9" fill="#FFFDF7" />
        {/* Sourire */}
        <path d="M84 94 Q100 106 116 94" stroke="#FFFDF7" strokeWidth="7" strokeLinecap="round" fill="none" />
        {/* Emblème sur le ventre */}
        <circle cx="100" cy="152" r="34" fill="#FFFDF7" />
        <g transform="translate(100 152) scale(0.5) translate(-50 -50)">
          <Glyph fill={def.colorDark} />
        </g>
      </g>
    </svg>
  )
}
