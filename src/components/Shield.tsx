/**
 * Bouclier rond à la couleur d'un héros, son emblème au centre.
 * Sert de zone de dépôt dans « Chaque héros son bouclier » (≥ 160 px).
 * En mode `neutral`, tous les boucliers prennent la même teinte étain :
 * seul l'emblème permet de trouver le bon — la couleur n'aide plus.
 */
import { HEROES, type HeroId, Emblem } from '../characters/heroes'

export function Shield({
  hero,
  size = 160,
  neutral = false,
}: {
  hero: HeroId
  size?: number
  neutral?: boolean
}) {
  const def = HEROES[hero]
  const ring = neutral ? '#565878' : def.colorDark
  const body = neutral ? '#8C8EAD' : def.color
  const glyph = neutral ? '#35365C' : def.colorDark
  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
        <circle cx="100" cy="100" r="96" fill={ring} />
        <circle cx="100" cy="100" r="80" fill={body} />
        <circle cx="100" cy="100" r="52" fill="#FFFDF7" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{ width: size * 0.36, height: size * 0.36 }}>
          <Emblem hero={hero} fill={glyph} />
        </div>
      </div>
    </div>
  )
}
