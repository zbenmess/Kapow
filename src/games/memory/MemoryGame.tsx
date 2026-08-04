/**
 * Memory des emblèmes — 7 niveaux adaptatifs.
 *
 * Niveaux 0-3 : paires identiques (3, 4, 6 puis 8 paires en 4×4).
 * Niveaux 4-6 : ASSOCIATION — apparier la carte emblème avec la carte
 * personnage du même héros (3, 4 puis 6 paires). Un vrai saut cognitif :
 * on passe de « identique » à « va ensemble ».
 *
 * Flip 3D 400 ms. Paire trouvée : les cartes grossissent, le son du héros
 * joue (et son prénom en mode association), elles restent visibles. Deux
 * cartes différentes : retournement automatique après 1,2 s, SANS son.
 * Une session = 3 grilles, la difficulté s'ajustant entre chacune.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EmblemBadge, HeroFigure, HERO_IDS, type HeroId } from '../../characters/heroes'
import { KapowBurst } from '../../components/KapowBurst'
import { clamp, useViewportSize } from '../../components/useViewportSize'
import { FLIP_MS, MISMATCH_MS } from '../../design/tokens'
import { useSound } from '../../audio/useSound'
import { useStore } from '../../store/useStore'

const LEVELS: { pairs: number; cols: number; mode: 'identique' | 'association' }[] = [
  { pairs: 3, cols: 3, mode: 'identique' },
  { pairs: 4, cols: 4, mode: 'identique' },
  { pairs: 6, cols: 4, mode: 'identique' },
  { pairs: 8, cols: 4, mode: 'identique' },
  { pairs: 3, cols: 3, mode: 'association' },
  { pairs: 4, cols: 4, mode: 'association' },
  { pairs: 6, cols: 4, mode: 'association' },
]

const GRIDS_PER_SESSION = 3

interface Card {
  key: number
  hero: HeroId
  face: 'embleme' | 'heros'
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(level: number): Card[] {
  const { pairs, mode } = LEVELS[level]
  const heroes = shuffle(HERO_IDS).slice(0, pairs)
  const raw =
    mode === 'identique'
      ? heroes.flatMap((h) => [
          { hero: h, face: 'embleme' as const },
          { hero: h, face: 'embleme' as const },
        ])
      : heroes.flatMap((h) => [
          { hero: h, face: 'embleme' as const },
          { hero: h, face: 'heros' as const },
        ])
  return shuffle(raw).map((c, key) => ({ ...c, key }))
}

export function MemoryGame() {
  const storeLevel = useStore((s) => s.levels.memory)
  const { setScreen, reportRound } = useStore()
  const [level, setLevel] = useState(storeLevel)
  const [gridCount, setGridCount] = useState(0)
  const [deck, setDeck] = useState<Card[]>(() => buildDeck(storeLevel))
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [celebrating, setCelebrating] = useState(false)
  const mismatches = useRef(0)
  const locked = useRef(false)
  const { play, voice, cheer } = useSound()
  const reduced = useReducedMotion()

  useEffect(() => {
    voice('memory-intro')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startGrid = (lv: number) => {
    setLevel(lv)
    setDeck(buildDeck(lv))
    setFlipped([])
    setMatched(new Set())
    setCelebrating(false)
    mismatches.current = 0
    locked.current = false
  }

  const tapCard = (card: Card) => {
    if (locked.current || celebrating) return
    if (flipped.includes(card.key) || matched.has(card.key)) return
    play('tap')
    const next = [...flipped, card.key]
    setFlipped(next)
    if (next.length < 2) return

    locked.current = true
    const [a, b] = next.map((k) => deck[k])
    if (a.hero === b.hero) {
      window.setTimeout(() => {
        play(`hero-${a.hero}`)
        if (LEVELS[level].mode === 'association') voice(`nom-${a.hero}`)
        setMatched((m) => new Set([...m, a.key, b.key]))
        setFlipped([])
        locked.current = false
      }, FLIP_MS)
    } else {
      // Pas de son, pas de pénalité : simple retournement après 1,2 s.
      mismatches.current += 1
      window.setTimeout(() => {
        setFlipped([])
        locked.current = false
      }, MISMATCH_MS)
    }
  }

  // Grille complétée → la difficulté s'ajuste, puis grille suivante / accueil.
  useEffect(() => {
    if (deck.length > 0 && matched.size === deck.length && !celebrating) {
      setCelebrating(true)
      locked.current = true
      const struggled = mismatches.current > LEVELS[level].pairs * 1.5
      reportRound('memory', struggled)
      window.setTimeout(() => {
        play('fanfare')
        cheer()
      }, 400)
      window.setTimeout(() => {
        if (gridCount + 1 < GRIDS_PER_SESSION) {
          setGridCount(gridCount + 1)
          startGrid(useStore.getState().levels.memory)
        } else {
          setScreen('home')
        }
      }, 2600)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched])

  const cols = LEVELS[level].cols

  // Largeur de carte calculée pour que toutes les rangées tiennent à l'écran
  // (cartes au ratio 3/4), sans descendre sous la cible tactile de 90 px.
  const { w: vw, h: vh } = useViewportSize()
  const rows = Math.ceil(deck.length / cols)
  const fitHeight = Math.floor(((vh - 40 - (rows - 1) * 24) * 3) / (4 * rows))
  const cardW = clamp(Math.min(Math.floor(vw * 0.18), fitHeight, 150), 90, 150)

  return (
    <div className="zone-jeu relative flex h-full w-full items-center justify-center bg-creme">
      <div
        className="grid gap-6 px-6"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: cols * 180 }}
      >
        {deck.map((card) => {
          const isUp = flipped.includes(card.key) || matched.has(card.key)
          const isMatched = matched.has(card.key)
          return (
            <div
              key={card.key}
              className="tappable cursor-pointer"
              style={{ width: cardW, perspective: 800 }}
              onPointerDown={(e) => {
                e.stopPropagation()
                tapCard(card)
              }}
            >
              <motion.div
                className="relative aspect-[3/4] w-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{
                  rotateY: reduced ? 0 : isUp ? 180 : 0,
                  opacity: 1,
                  scale: isMatched ? 1.08 : 1,
                }}
                transition={{ duration: FLIP_MS / 1000, ease: 'easeInOut' }}
              >
                {/* Dos de carte : étoile Kapow en filigrane */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-3xl bg-encre/90 shadow-pose"
                  style={{
                    backfaceVisibility: 'hidden',
                    opacity: reduced && isUp ? 0 : undefined,
                  }}
                >
                  <svg viewBox="0 0 24 24" className="h-1/3 w-1/3" aria-hidden="true">
                    <path
                      d="M12 2 L14 8 L20 6 L16 12 L22 14 L15 15 L16 22 L12 17 L8 22 L9 15 L2 14 L8 12 L4 6 L10 8 Z"
                      fill="#FFF6E9"
                      opacity="0.5"
                    />
                  </svg>
                </div>
                {/* Face : emblème ou personnage selon la carte */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-3xl bg-coquille p-3 shadow-pose"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: reduced ? undefined : 'rotateY(180deg)',
                    opacity: reduced ? (isUp ? 1 : 0) : undefined,
                  }}
                >
                  <div className="h-full w-full">
                    {card.face === 'embleme' ? (
                      <EmblemBadge hero={card.hero} />
                    ) : (
                      <HeroFigure hero={card.hero} />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
      {celebrating && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <KapowBurst />
        </div>
      )}
    </div>
  )
}
