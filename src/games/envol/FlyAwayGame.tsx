/**
 * Qui s'est envolé ?
 *
 * Trois héros alignés. Voix off « Regarde bien », pause de 3 s, puis l'un
 * d'eux s'envole hors de l'écran. Deux vignettes très espacées apparaissent
 * en bas. Bonne réponse : le héros revient en volant à sa place. Mauvaise
 * réponse : la vignette rebondit doucement, rien d'autre — on peut
 * réessayer indéfiniment.
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

const ROUNDS = 4

type Phase = 'observe' | 'fly' | 'choice' | 'return' | 'celebrate'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Round {
  trio: HeroId[]
  goneIndex: number
  options: HeroId[]
}

function makeRound(): Round {
  const trio = shuffle(HERO_IDS).slice(0, 3)
  const goneIndex = Math.floor(Math.random() * 3)
  const distractor = trio[(goneIndex + 1 + Math.floor(Math.random() * 2)) % 3]
  return { trio, goneIndex, options: shuffle([trio[goneIndex], distractor]) }
}

export function FlyAwayGame() {
  const [round, setRound] = useState<Round>(() => makeRound())
  const [roundCount, setRoundCount] = useState(0)
  const [phase, setPhase] = useState<Phase>('observe')
  const [wrongBounce, setWrongBounce] = useState<HeroId | null>(null)
  const locked = useRef(false)
  const { play, voice } = useSound()
  const { setScreen, bumpProgress } = useStore()
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

  const choose = (hero: HeroId) => {
    if (phase !== 'choice' || locked.current) return
    if (hero === round.trio[round.goneIndex]) {
      locked.current = true
      setPhase('return')
      play('whoosh-down')
      window.setTimeout(() => {
        play(`hero-${hero}`)
        voice('bravo')
        setPhase('celebrate')
      }, 900)
      window.setTimeout(() => {
        bumpProgress('envol')
        if (roundCount + 1 < ROUNDS) {
          setRound(makeRound())
          setRoundCount((c) => c + 1)
          setPhase('observe')
          locked.current = false
        } else {
          play('fanfare')
          window.setTimeout(() => setScreen('home'), 1800)
        }
      }, 2300)
    } else {
      // Mauvaise réponse : rebond doux, rien d'autre, réessai illimité.
      setWrongBounce(hero)
      window.setTimeout(() => setWrongBounce(null), 500)
    }
  }

  const heroHidden = phase === 'fly' || phase === 'choice'

  // Tailles adaptées à la hauteur d'écran (téléphone paysage compris).
  const { h } = useViewportSize()
  const heroSize = clamp(Math.floor(h * 0.28), 100, 170)
  const thumbBox = clamp(Math.floor(h * 0.3), 110, 160)

  return (
    <div className="zone-jeu relative flex h-full w-full flex-col items-center justify-center bg-creme">
      {/* Les trois héros */}
      <div className="flex items-end justify-center gap-16">
        {round.trio.map((hero, i) => {
          const isGone = i === round.goneIndex
          return (
            <motion.div
              key={`${roundCount}-${hero}`}
              animate={
                isGone
                  ? reduced
                    ? { opacity: heroHidden ? 0 : 1 }
                    : {
                        y: heroHidden ? -700 : 0,
                        x: heroHidden ? 120 : 0,
                        rotate: heroHidden ? -18 : 0,
                      }
                  : {}
              }
              transition={{ duration: 0.85, ease: heroHidden ? 'easeIn' : 'easeOut' }}
            >
              <Hero hero={hero} size={heroSize} />
            </motion.div>
          )
        })}
      </div>

      {/* Les deux vignettes de réponse, très espacées */}
      <div className="mt-4 w-full" style={{ height: thumbBox + 12 }}>
        {phase === 'choice' && (
          <motion.div
            className="flex h-full w-full items-center justify-between px-[12vw]"
            initial={{ opacity: 0, y: reduced ? 0 : 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {round.options.map((hero) => (
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
