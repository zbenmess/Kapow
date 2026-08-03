/**
 * Seul élément de navigation dans un jeu : flèche ronde en haut à gauche,
 * 90 × 90 px, retour à l'accueil.
 */
import { useStore } from '../store/useStore'
import { TileButton } from './TileButton'

export function BackButton() {
  const setScreen = useStore((s) => s.setScreen)
  return (
    <div className="absolute left-4 top-4 z-40">
      <TileButton
        onPress={() => setScreen('home')}
        className="flex h-[90px] w-[90px] items-center justify-center rounded-full bg-coquille shadow-pose"
      >
        <svg viewBox="0 0 48 48" width="46" height="46" aria-hidden="true">
          <path
            d="M28 12 L16 24 L28 36"
            fill="none"
            stroke="#35365C"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </TileButton>
    </div>
  )
}
