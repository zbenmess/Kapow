/**
 * Écran d'accueil : quatre grandes tuiles illustrées plein écran, une par
 * jeu — aucun texte. Chaque tuile montre le jeu par un pictogramme.
 */
import { useStore, type GameId } from './store/useStore'
import { TileButton } from './components/TileButton'
import { EmblemBadge, HeroFigure } from './characters/heroes'
import { ParentGate } from './parent/ParentGate'

/** Pictogramme « Memory » : deux cartes, une retournée. */
function PictoMemory() {
  return (
    <div className="flex items-center gap-4">
      <div className="h-32 w-24 -rotate-6 rounded-3xl bg-coquille p-4 shadow-pose">
        <div className="h-full w-full">
          <EmblemBadge hero="volta" />
        </div>
      </div>
      <div className="flex h-32 w-24 rotate-6 items-center justify-center rounded-3xl bg-encre/15 shadow-pose">
        <div className="h-10 w-10 rounded-full bg-coquille/70" />
      </div>
    </div>
  )
}

/** Pictogramme « Qui s'est envolé ? » : Alto qui décolle. */
function PictoEnvol() {
  return (
    <div className="relative h-40 w-40">
      <div className="absolute inset-x-0 top-0 h-32 w-32 mx-auto -rotate-12">
        <HeroFigure hero="alto" />
      </div>
      <svg viewBox="0 0 100 30" className="absolute bottom-0 w-full" aria-hidden="true">
        <g stroke="#FFFDF7" strokeWidth="6" strokeLinecap="round" opacity="0.8">
          <line x1="20" y1="8" x2="20" y2="24" />
          <line x1="50" y1="2" x2="50" y2="26" />
          <line x1="80" y1="8" x2="80" y2="24" />
        </g>
      </svg>
    </div>
  )
}

/** Pictogramme « Boucliers » : Mira face à son bouclier (contraste sur le vert). */
function PictoBoucliers() {
  return (
    <div className="flex items-center gap-5">
      <div className="h-32 w-28">
        <HeroFigure hero="mira" />
      </div>
      <svg viewBox="0 0 200 200" className="h-28 w-28" aria-hidden="true">
        <circle cx="100" cy="100" r="96" fill="#64489E" />
        <circle cx="100" cy="100" r="76" fill="#FFFDF7" />
        <circle cx="100" cy="100" r="50" fill="#8A6BC9" />
      </svg>
    </div>
  )
}

/** Pictogramme « La toile » : chemin pointillé entre deux points. */
function PictoToile() {
  return (
    <svg viewBox="0 0 200 120" className="h-36 w-56" aria-hidden="true">
      <path
        d="M25 95 Q70 20 110 60 T 175 30"
        fill="none"
        stroke="#FFFDF7"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="1 22"
      />
      <circle cx="25" cy="95" r="17" fill="#FFFDF7" />
      <circle cx="175" cy="30" r="17" fill="#35365C" opacity="0.5" />
      <circle cx="175" cy="30" r="10" fill="#FFFDF7" />
    </svg>
  )
}

const TILES: { id: GameId; bg: string; picto: () => JSX.Element }[] = [
  { id: 'memory', bg: 'bg-volta', picto: PictoMemory },
  { id: 'envol', bg: 'bg-givro', picto: PictoEnvol },
  { id: 'boucliers', bg: 'bg-roc', picto: PictoBoucliers },
  { id: 'toile', bg: 'bg-zoum', picto: PictoToile },
]

export function Home() {
  const setScreen = useStore((s) => s.setScreen)
  const enabledGames = useStore((s) => s.enabledGames)
  const tiles = TILES.filter((t) => enabledGames[t.id])

  return (
    <div className="relative h-full w-full bg-creme p-6">
      <div
        className={`grid h-full w-full gap-6 ${
          tiles.length > 2 ? 'grid-cols-2 grid-rows-2' : tiles.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {tiles.map((t) => {
          const Picto = t.picto
          return (
            <TileButton
              key={t.id}
              onPress={() => setScreen(t.id)}
              className={`flex items-center justify-center rounded-blob ${t.bg} shadow-pose`}
            >
              <Picto />
            </TileButton>
          )
        })}
      </div>
      <ParentGate />
    </div>
  )
}
