/**
 * Un héros à l'écran, à taille donnée (minimum 90 px — taille tactile).
 */
import { HeroFigure, type HeroId } from '../characters/heroes'

export function Hero({ hero, size = 160, ghost = false }: { hero: HeroId; size?: number; ghost?: boolean }) {
  return (
    <div style={{ width: size, height: size * 1.2 }}>
      <HeroFigure hero={hero} ghost={ghost} />
    </div>
  )
}
