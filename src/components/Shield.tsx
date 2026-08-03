/**
 * Bouclier rond à la couleur d'un héros, son emblème au centre.
 * Sert de zone de dépôt dans « Chaque héros son bouclier » (≥ 160 px).
 */
import { HEROES, type HeroId, Emblem } from '../characters/heroes'

export function Shield({ hero, size = 160 }: { hero: HeroId; size?: number }) {
  const def = HEROES[hero]
  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
        <circle cx="100" cy="100" r="96" fill={def.colorDark} />
        <circle cx="100" cy="100" r="80" fill={def.color} />
        <circle cx="100" cy="100" r="52" fill="#FFFDF7" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{ width: size * 0.36, height: size * 0.36 }}>
          <Emblem hero={hero} fill={def.colorDark} />
        </div>
      </div>
    </div>
  )
}
