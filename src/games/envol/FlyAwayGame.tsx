/**
 * Qui s'est envolé ? — 4 niveaux adaptatifs.
 *
 *   Niveau 0 : 3 héros alignés, 1 s'envole, 2 vignettes.
 *   Niveau 1 : 4 héros, 1 s'envole, 3 vignettes.
 *   Niveau 2 : 5 héros, 1 s'envole, 3 vignettes.
 *   Niveau 3 : 4 héros, DEUX s'envolent, 4 vignettes — il faut retrouver
 *              les deux, chacun revient en volant dès qu'on le nomme.
 *
 * Voix off « Regarde bien », pause de 3 s, puis l'envol. Bonne réponse :
 * le héros revient en volant à sa place. Mauvaise réponse : la vignette
 * rebondit doucement, rien d'autre — on peut réessayer indéfiniment.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HERO_IDS, type HeroId } from '../../characters/heroes'
import { Hero } from '../../components/Hero'
import { KapowBurst } from '../../components/KapowBurst'
import { clamp, useViewportSize } from '../../components/useViewportSize'
import { OBSERVE_MS } from '../../design/tokens'
import { useSound } from '../../audio/useSound'
import { useStore } from '../../store/useStore'

const TIERS = [
  { lineup: 3, gone: 1, options: 2 },
  { lineup: 4, gone: 1, options: 3 },
  { lineup: 5, gone: 1, options: 3 },
  { lineup: 4, gone: 2, options: 4 },
]

const ROUNDS = 4

type Phase = 'observe' | 'fly' | 'choice' | 'celebrate'

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
  lineup: HeroId[]
  gone: HeroId[]
  options: HeroId[]
}

function makeRound(tier: number): Round {
  const t = TIERS[tier]
  const lineup = shuffle(HERO_IDS).slice(0, t.lineup)
  const gone = shuffle(lineup).slice(0, t.gone)
  const distractors = shuffle(lineup.filter((h) => !gone.includes(h))).slice(0, t.options - t.gone)
  return { tier, lineup, gone, options: shuffle([...gone, ...distractors]) }
}

export function FlyAwayGame() {
  const storeLevel = useStore((s) => s.levels.envol)
  const { setScreen, reportRound } = useStore()
  const [round, setRound] = useState<Round>(() => makeRound(storeLevel))
  const [roundCount, setRoundCount] = useState(0)
  const [phase, setPhase] = useState<Phase>('observe')
  const [returned, setReturned] = useState<Set<HeroId>>(new Set())
  const [wrongBounce, setWrongBounce] = useState<HeroId | null>(null)
  const wrongTaps = useRef(0)
  const locked = useRef(false)
  const { play, voice, cheer } = useSound()
  const reduced = useReducedMotion()

  // Déroulé d'un tour : observation 3 s → envol → choix.
  // L'effet ne dépend QUE du tour : s'il dépendait aussi de la phase, son
  // nettoyage annulerait le second timer au passage observe → fly, et les
  // vignettes de réponse n'apparaîtraient jamais.
  useEffect(() => {
    voice('regarde-bien')
    const t1 = window.setTimeout(() => {
      setPhase('fly')
      play('whoosh-up')
    }, OBSERVE_MS)
    const t2 = window.setTimeout(() => setPhase('choice'), OBSERVE_MS + 900)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  const finishRound = () => {
    locked.current = true
    setPhase('celebrate')
    cheer()
    reportRound('envol', wrongTaps.current >= 2)
    window.setTimeout(() => {
      if (roundCount + 1 < ROUNDS) {
        setRound(makeRound(useStore.getState().levels.envol))
        setRoundCount((c) => c + 1)
        setPhase('observe')
        setReturned(new Set())
        wrongTaps.current = 0
        locked.current = false
      } else {
        play('fanfare')
        window.setTimeout(() => setScreen('home'), 1800)
      }
    }, 2300)
  }

  const choose = (hero: HeroId) => {
    if (phase !== 'choice' || locked.current) return
    if (round.gone.includes(hero) && !returned.has(hero)) {
      play('whoosh-down')
      const nextReturned = new Set([...returned, hero])
      setReturned(nextReturned)
      window.setTimeout(() => play(`hero-${hero}`), 850)
      if (nextReturned.size === round.gone.length) {
        window.setTimeout(finishRound, 950)
      }
    } else {
      // Mauvaise réponse : rebond doux, rien d'autre, réessai illimité.
      wrongTaps.current += 1
      setWrongBounce(hero)
      window.setTimeout(() => setWrongBounce(null), 500)
    }
  }

  // Tailles adaptées à la hauteur ET au nombre de héros alignés.
  const { w, h } = useViewportSize()
  const gap = clamp(Math.floor(w * 0.03), 16, 64)
  const heroSize = Math.min(
    clamp(Math.floor(h * 0.28), 100, 170),
    Math.floor((w * 0.85 - (round.lineup.length - 1) * gap) / round.lineup.length),
  )
  const thumbBox = clamp(Math.floor(h * 0.3), 110, 160)
  const remainingOptions = round.options.filter((o) => !returned.has(o))

  return (
    <div className="zone-jeu relative flex h-full w-full flex-col items-center justify-center bg-creme">
      {/* Les héros alignés */}
      <div className="flex items-end justify-center" style={{ gap }}>
        {round.lineup.map((hero) => {
          const isGone = round.gone.includes(hero)
          const hidden =
            isGone && !returned.has(hero) && (phase === 'fly' || phase === 'choice')
          return (
            <motion.div
              key={`${roundCount}-${hero}`}
              animate={
                isGone
                  ? reduced
                    ? { opacity: hidden ? 0 : 1 }
                    : {
                        y: hidden ? -700 : 0,
                        x: hidden ? 120 : 0,
                        rotate: hidden ? -18 : 0,
                      }
                  : {}
              }
              transition={{ duration: 0.85, ease: hidden ? 'easeIn' : 'easeOut' }}
            >
              <Hero hero={hero} size={heroSize} />
            </motion.div>
          )
        })}
      </div>

      {/* Les vignettes de réponse, très espacées */}
      <div className="mt-4 w-full" style={{ height: thumbBox + 12 }}>
        {phase === 'choice' && (
          <motion.div
            className="flex h-full w-full items-center justify-evenly px-[6vw]"
            initial={{ opacity: 0, y: reduced ? 0 : 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {remainingOptions.map((hero) => (
              <motion.div
                key={hero}
                animate={wrongBounce === hero ? { y: [0, -14, 0, -7, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <div
                  className="tappable flex cursor-pointer items-center justify-center rounded-blob bg-coquille shadow-pose active:scale-95"
                  style={{ width: thumbBox, height: thumbBox }}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    choose(hero)
                  }}
                >
                  <Hero hero={hero} size={Math.floor(thumbBox * 0.66)} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {phase === 'celebrate' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <KapowBurst color="#45A8DC" />
        </div>
      )}
    </div>
  )
}
