/**
 * L'intrus — discrimination visuelle, 3 niveaux adaptatifs.
 *
 *   Niveau 0 : quatre héros, trois identiques, taper le différent.
 *   Niveau 1 : quatre emblèmes colorés, trois identiques, un différent.
 *   Niveau 2 : quatre emblèmes de la MÊME couleur — seule la forme change.
 *
 * Bonne réponse : l'intrus grossit, son du héros, étoile Kapow, tour
 * suivant. Mauvaise réponse : la vignette rebondit doucement, rien d'autre.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Emblem, EmblemBadge, HeroFigure, HEROES, HERO_IDS, type HeroId } from '../../characters/heroes'
import { KapowBurst } from '../../components/KapowBurst'
import { clamp, useViewportSize } from '../../components/useViewportSize'
import { useSound } from '../../audio/useSound'
import { useStore } from '../../store/useStore'

const ROUNDS = 5

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Round {
  tier: number
  common: HeroId
  odd: HeroId
  oddIndex: number
}

function makeRound(tier: number): Round {
  const [common, odd] = shuffle(HERO_IDS)
  return { tier, common, odd, oddIndex: Math.floor(Math.random() * 4) }
}

export function OddOneOutGame() {
  const storeLevel = useStore((s) => s.levels.intrus)
  const { setScreen, reportRound } = useStore()
  const [round, setRound] = useState<Round>(() => makeRound(storeLevel))
  const [roundCount, setRoundCount] = useState(0)
  const [found, setFound] = useState(false)
  const [wrongBounce, setWrongBounce] = useState<number | null>(null)
  const wrongTaps = useRef(0)
  const locked = useRef(false)
  const { play, voice, cheer } = useSound()
  const reduced = useReducedMotion()

  useEffect(() => {
    voice('intrus-intro')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const choose = (index: number) => {
    if (locked.current || found) return
    if (index === round.oddIndex) {
      locked.current = true
      setFound(true)
      play(`hero-${round.odd}`)
      cheer()
      reportRound('intrus', wrongTaps.current >= 2)
      window.setTimeout(() => {
        if (roundCount + 1 < ROUNDS) {
          setRound(makeRound(useStore.getState().levels.intrus))
          setRoundCount((c) => c + 1)
          setFound(false)
          wrongTaps.current = 0
          locked.current = false
        } else {
          play('fanfare')
          window.setTimeout(() => setScreen('home'), 1800)
        }
      }, 2000)
    } else {
      // Mauvaise réponse : rebond doux, rien d'autre, réessai illimité.
      wrongTaps.current += 1
      setWrongBounce(index)
      window.setTimeout(() => setWrongBounce(null), 500)
    }
  }

  const { w, h } = useViewportSize()
  const box = clamp(Math.min(Math.floor(h * 0.42), Math.floor((w - 5 * 24) / 4)), 110, 200)

  const cell = (index: number) => {
    const hero = index === round.oddIndex ? round.odd : round.common
    const isOdd = index === round.oddIndex
    return (
      <motion.div
        key={`${roundCount}-${index}`}
        animate={
          wrongBounce === index
            ? { y: [0, -14, 0, -7, 0] }
            : found && isOdd
              ? { scale: reduced ? 1 : 1.18 }
              : {}
        }
        transition={{ duration: 0.5 }}
      >
        <div
          className="tappable flex cursor-pointer items-center justify-center rounded-blob bg-coquille shadow-pose active:scale-95"
          style={{ width: box, height: box }}
          onPointerDown={(e) => {
            e.stopPropagation()
            choose(index)
          }}
        >
          {round.tier === 0 ? (
            <div style={{ width: box * 0.62, height: box * 0.75 }}>
              <HeroFigure hero={hero} />
            </div>
          ) : round.tier === 1 ? (
            <div style={{ width: box * 0.66, height: box * 0.66 }}>
              <EmblemBadge hero={hero} />
            </div>
          ) : (
            // Niveau 2 : même couleur pour tous — seule la forme distingue.
            <div style={{ width: box * 0.6, height: box * 0.6 }}>
              <Emblem hero={hero} fill={HEROES.mira.colorDark} />
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="zone-jeu relative flex h-full w-full items-center justify-center bg-creme">
      <div className="flex flex-wrap items-center justify-center gap-6 px-6">
        {[0, 1, 2, 3].map(cell)}
      </div>
      {found && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <KapowBurst color="#8A6BC9" />
        </div>
      )}
    </div>
  )
}
