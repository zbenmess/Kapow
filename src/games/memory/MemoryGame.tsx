/**
 * Memory des emblèmes.
 *
 * Niveaux : 3 paires (2×3) → 4 paires (2×4) → 6 paires (3×4).
 * Flip 3D 400 ms. Paire trouvée : les cartes grossissent, le son du héros
 * joue, elles restent visibles. Deux cartes différentes : retournement
 * automatique après 1,2 s, SANS son — l'erreur ne déclenche rien.
 * Progression automatique au niveau suivant, puis retour à l'accueil.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EmblemBadge, HERO_IDS, type HeroId } from '../../characters/heroes'
import { KapowBurst } from '../../components/KapowBurst'
import { FLIP_MS, MISMATCH_MS } from '../../design/tokens'
import { useSound } from '../../audio/useSound'
import { useStore } from '../../store/useStore'

const LEVELS = [
  { pairs: 3, cols: 3 },
  { pairs: 4, cols: 4 },
  { pairs: 6, cols: 4 },
]

interface Card {
  key: number
  hero: HeroId
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(pairs: number): Card[] {
  const heroes = shuffle(HERO_IDS).slice(0, pairs)
  return shuffle(heroes.flatMap((h) => [h, h])).map((hero, key) => ({ key, hero }))
}

export function MemoryGame() {
  const [level, setLevel] = useState(0)
  const [deck, setDeck] = useState<Card[]>(() => buildDeck(LEVELS[0].pairs))
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [celebrating, setCelebrating] = useState(false)
  const locked = useRef(false)
  const { play, voice } = useSound()
  const { setScreen, bumpProgress } = useStore()
  const reduced = useReducedMotion()

  useEffect(() => {
    voice('memory-intro')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startLevel = (lv: number) => {
    setLevel(lv)
    setDeck(buildDeck(LEVELS[lv].pairs))
    setFlipped([])
    setMatched(new Set())
    setCelebrating(false)
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
      // Paire : grossissement + son du héros, cartes définitivement visibles.
      window.setTimeout(() => {
        play(`hero-${a.hero}`)
        setMatched((m) => {
          const nm = new Set(m)
          nm.add(a.key)
          nm.add(b.key)
          return nm
        })
        setFlipped([])
        locked.current = false
      }, FLIP_MS)
    } else {
      // Pas de son, pas de pénalité : simple retournement après 1,2 s.
      window.setTimeout(() => {
        setFlipped([])
        locked.current = false
      }, MISMATCH_MS)
    }
  }

  // Grille complétée → célébration puis niveau suivant (ou accueil).
  useEffect(() => {
    if (deck.length > 0 && matched.size === deck.length && !celebrating) {
      setCelebrating(true)
      locked.current = true
      bumpProgress('memory')
      window.setTimeout(() => {
        play('fanfare')
        voice('bravo')
      }, 400)
      window.setTimeout(() => {
        if (level + 1 < LEVELS.length) startLevel(level + 1)
        else setScreen('home')
      }, 2600)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched])

  const cols = LEVELS[level].cols

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
              style={{ width: 'min(150px, 18vw, 21vh)', minWidth: 90, perspective: 800 }}
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
                {/* Face : emblème du héros */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-3xl bg-coquille p-4 shadow-pose"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: reduced ? undefined : 'rotateY(180deg)',
                    opacity: reduced ? (isUp ? 1 : 0) : undefined,
                  }}
                >
                  <div className="h-full w-full">
                    <EmblemBadge hero={card.hero} />
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
