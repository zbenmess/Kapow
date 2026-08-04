/**
 * Écran d'accueil : six grandes tuiles illustrées, une par jeu — aucun
 * texte. Chaque tuile montre le jeu par un pictogramme, et porte jusqu'à
 * cinq petites étoiles Kapow : la trace visible des progrès, sans chiffre.
 */
import { starsFor, useStore, type GameId } from './store/useStore'
import { TileButton } from './components/TileButton'
import { Emblem, EmblemBadge, HeroFigure } from './characters/heroes'
import { ParentGate } from './parent/ParentGate'

/** Pictogramme « Memory » : deux cartes, une retournée. */
function PictoMemory() {
  return (
    <div className="flex items-center gap-4">
      <div className="h-28 w-20 -rotate-6 rounded-3xl bg-coquille p-3 shadow-pose">
        <div className="h-full w-full">
          <EmblemBadge hero="volta" />
        </div>
      </div>
      <div className="flex h-28 w-20 rotate-6 items-center justify-center rounded-3xl bg-encre/15 shadow-pose">
        <div className="h-9 w-9 rounded-full bg-coquille/70" />
      </div>
    </div>
  )
}

/** Pictogramme « Qui s'est envolé ? » : Alto qui décolle. */
function PictoEnvol() {
  return (
    <div className="relative h-36 w-36">
      <div className="absolute inset-x-0 top-0 mx-auto h-28 w-28 -rotate-12">
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
    <div className="flex items-center gap-4">
      <div className="h-28 w-24">
        <HeroFigure hero="mira" />
      </div>
      <svg viewBox="0 0 200 200" className="h-24 w-24" aria-hidden="true">
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
    <svg viewBox="0 0 200 120" className="h-32 w-48" aria-hidden="true">
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

/** Pictogramme « L'intrus » : trois flocons... et une flamme. */
function PictoIntrus() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(['givro', 'givro', 'braise', 'givro'] as const).map((hero, i) => (
        <div key={i} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coquille/90 p-2 shadow-pose">
          <div className="h-10 w-10">
            <Emblem hero={hero} fill={hero === 'braise' ? '#C9404F' : '#2C7FAD'} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Pictogramme « L'écho » : trois pastilles et des ondes sonores. */
function PictoEcho() {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 60 24" className="h-8 w-20" aria-hidden="true">
        <g stroke="#FFFDF7" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85">
          <path d="M8 12 Q14 4 20 12" />
          <path d="M26 12 Q32 2 38 12" />
          <path d="M44 12 Q50 4 56 12" />
        </g>
      </svg>
      <div className="flex gap-3">
        {(['volta', 'zoum', 'givro'] as const).map((hero) => (
          <div key={hero} className="h-14 w-14">
            <EmblemBadge hero={hero} />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Petite étoile Kapow blanche (progrès gagné). */
function Star() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 2 L14 8 L20 6 L16 12 L22 14 L15 15 L16 22 L12 17 L8 22 L9 15 L2 14 L8 12 L4 6 L10 8 Z"
        fill="#FFFDF7"
        opacity="0.9"
      />
    </svg>
  )
}

const TILES: { id: GameId; bg: string; picto: () => JSX.Element }[] = [
  { id: 'memory', bg: 'bg-volta', picto: PictoMemory },
  { id: 'envol', bg: 'bg-givro', picto: PictoEnvol },
  { id: 'boucliers', bg: 'bg-roc', picto: PictoBoucliers },
  { id: 'toile', bg: 'bg-zoum', picto: PictoToile },
  { id: 'intrus', bg: 'bg-mira', picto: PictoIntrus },
  { id: 'echo', bg: 'bg-braise', picto: PictoEcho },
]

export function Home() {
  const setScreen = useStore((s) => s.setScreen)
  const enabledGames = useStore((s) => s.enabledGames)
  const levels = useStore((s) => s.levels)
  const tiles = TILES.filter((t) => enabledGames[t.id])
  const gridClass =
    tiles.length > 4
      ? 'grid-cols-3 grid-rows-2'
      : tiles.length > 2
        ? 'grid-cols-2 grid-rows-2'
        : tiles.length === 2
          ? 'grid-cols-2'
          : 'grid-cols-1'

  return (
    <div className="relative h-full w-full bg-creme p-5">
      <div className={`grid h-full w-full gap-5 ${gridClass}`}>
        {tiles.map((t) => {
          const Picto = t.picto
          const stars = starsFor(t.id, levels[t.id])
          return (
            <TileButton
              key={t.id}
              onPress={() => setScreen(t.id)}
              className={`relative flex items-center justify-center rounded-blob ${t.bg} shadow-pose`}
            >
              <Picto />
              {stars > 0 && (
                <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                  {Array.from({ length: stars }, (_, i) => (
                    <Star key={i} />
                  ))}
                </div>
              )}
            </TileButton>
          )
        })}
      </div>
      <ParentGate />
    </div>
  )
}
