/**
 * L'écho Kapow — mémoire auditive, 3 niveaux adaptatifs.
 *
 * Des pastilles-héros s'illuminent l'une après l'autre en jouant leur motif
 * sonore ; la voix dit « À toi ! » et l'enfant rejoue la séquence.
 *
 *   Niveau 0 : 3 pastilles, séquence de 2.
 *   Niveau 1 : 3 pastilles, séquence de 3.
 *   Niveau 2 : 4 pastilles, séquence de 3.
 *
 * AUCUN échec : une erreur ne déclenche rien de négatif — après une courte
 * pause, la séquence se rejoue patiemment et l'enfant réessaie.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EmblemBadge, HERO_IDS, type HeroId } from '../../characters/heroes'
import { KapowBurst } from '../../components/KapowBurst'
import { clamp, useViewportSize } from '../../components/useViewportSize'
import { useSound } from '../../audio/useSound'
import { useStore } from '../../store/useStore'

const TIERS = [
  { pads: 3, length: 2 },
  { pads: 3, length: 3 },
  { pads: 4, length: 3 },
]

const ROUNDS = 3
const STEP_MS = 750

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
  pads: HeroId[]
  seq: number[]
}

function makeRound(tier: number): Round {
  const t = TIERS[tier]
  const pads = shuffle(HERO_IDS).slice(0, t.pads)
  const seq: number[] = []
  for (let i = 0; i < t.length; i++) {
    let n = Math.floor(Math.random() * t.pads)
    // Éviter deux fois la même pastille d'affilée : plus lisible pour l'oreille.
    if (i > 0 && n === seq[i - 1]) n = (n + 1) % t.pads
    seq.push(n)
  }
  return { tier, pads, seq }
}

export function EchoGame() {
  const storeLevel = useStore((s) => s.levels.echo)
  const { setScreen, reportRound } = useStore()
  const [round, setRound] = useState<Round>(() => makeRound(storeLevel))
  const [roundCount, setRoundCount] = useState(0)
  const [lit, setLit] = useState<number | null>(null)
  const [listening, setListening] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const inputPos = useRef(0)
  const replays = useRef(0)
  const timers = useRef<number[]>([])
  const { play, voice, cheer } = useSound()
  const reduced = useReducedMotion()

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  /** Joue la séquence en illuminant les pastilles, puis rend la main. */
  const playSequence = (r: Round, withIntro: boolean) => {
    setListening(false)
    inputPos.current = 0
    let at = withIntro ? 900 : 400
    if (withIntro) voice('echo-intro')
    r.seq.forEach((padIndex) => {
      timers.current.push(
        window.setTimeout(() => {
          setLit(padIndex)
          play(`hero-${r.pads[padIndex]}`)
        }, at),
      )
      timers.current.push(window.setTimeout(() => setLit(null), at + STEP_MS - 120))
      at += STEP_MS
    })
    timers.current.push(
      window.setTimeout(() => {
        voice('a-toi')
        setListening(true)
      }, at + 200),
    )
  }

  useEffect(() => {
    playSequence(round, roundCount === 0)
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  const tapPad = (index: number) => {
    if (!listening || celebrating) return
    const expected = round.seq[inputPos.current]
    // Toute pastille touchée s'illumine et joue son motif : le feedback est
    // toujours positif, c'est l'instrument qui répond.
    setLit(index)
    play(`hero-${round.pads[index]}`)
    window.setTimeout(() => setLit(null), 350)

    if (index === expected) {
      inputPos.current += 1
      if (inputPos.current === round.seq.length) {
        // Séquence complète !
        setListening(false)
        setCelebrating(true)
        reportRound('echo', replays.current >= 2)
        window.setTimeout(() => {
          play('fanfare')
          cheer()
        }, 500)
        window.setTimeout(() => {
          if (roundCount + 1 < ROUNDS) {
            setRound(makeRound(useStore.getState().levels.echo))
            setRoundCount((c) => c + 1)
            replays.current = 0
            setCelebrating(false)
          } else {
            setScreen('home')
          }
        }, 2600)
      }
    } else {
      // Pas le bon ordre : après une petite pause, on réécoute — patiemment.
      setListening(false)
      replays.current += 1
      timers.current.push(window.setTimeout(() => playSequence(round, false), 900))
    }
  }

  const { w, h } = useViewportSize()
  const pad = clamp(
    Math.min(Math.floor(h * 0.4), Math.floor((w - (round.pads.length + 1) * 32) / round.pads.length)),
    110,
    190,
  )

  return (
    <div className="zone-jeu relative flex h-full w-full items-center justify-center bg-creme">
      <div className="flex items-center justify-center gap-8 px-6">
        {round.pads.map((hero, i) => (
          <motion.div
            key={`${roundCount}-${hero}`}
            animate={
              lit === i
                ? reduced
                  ? { opacity: 1 }
                  : { scale: 1.16 }
                : reduced
                  ? { opacity: 0.92 }
                  : { scale: 1 }
            }
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
          >
            <div
              className={`tappable cursor-pointer rounded-full shadow-pose ${lit === i ? 'shadow-flottant' : ''}`}
              style={{ width: pad, height: pad }}
              onPointerDown={(e) => {
                e.stopPropagation()
                tapPad(i)
              }}
            >
              <EmblemBadge hero={hero} />
            </div>
          </motion.div>
        ))}
      </div>
      {celebrating && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <KapowBurst color="#C9404F" />
        </div>
      )}
    </div>
  )
}
