/**
 * La toile — tracé au doigt.
 *
 * Un point de départ pulsant, un chemin en pointillés, un point d'arrivée.
 * Niveaux : ligne droite → courbe simple → zigzag.
 * Le trait se dessine sous le doigt tant qu'il reste à moins de 45 px
 * (écran) du chemin. Sortie de tolérance : le trait s'arrête simplement ;
 * on reprend depuis le dernier point valide. Arrivée : le chemin s'illumine
 * et l'étoile Kapow éclate.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { KapowBurst } from '../../components/KapowBurst'
import { COLORS, TRACE_TOLERANCE } from '../../design/tokens'
import { useSound } from '../../audio/useSound'
import { useStore } from '../../store/useStore'

// Espace de dessin : viewBox 1000 × 560, adapté au paysage.
const VIEW_W = 1000
const VIEW_H = 560

const LEVELS: { d: string; color: string }[] = [
  { d: 'M 140 280 L 860 280', color: COLORS.zoum }, // ligne droite
  { d: 'M 140 400 Q 500 60 860 400', color: COLORS.givro }, // courbe simple
  { d: 'M 120 420 L 350 140 L 570 420 L 790 140', color: COLORS.volta }, // zigzag
]

const SAMPLES = 220

/** Échantillonne le chemin en polyligne pour le suivi du doigt. */
function samplePath(d: string): { x: number; y: number }[] {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', d)
  const len = path.getTotalLength()
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i <= SAMPLES; i++) {
    const p = path.getPointAtLength((i / SAMPLES) * len)
    pts.push({ x: p.x, y: p.y })
  }
  return pts
}

export function WebTraceGame() {
  const [level, setLevel] = useState(0)
  const [progress, setProgress] = useState(0) // index du dernier échantillon validé
  const [done, setDone] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const tracing = useRef(false)
  const progressRef = useRef(0)
  const { play, voice } = useSound()
  const { setScreen, bumpProgress } = useStore()
  const reduced = useReducedMotion()

  const { d, color } = LEVELS[level]
  const points = useMemo(() => samplePath(d), [d])

  useEffect(() => {
    const t = window.setTimeout(() => voice('toile-intro'), 300)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Pointeur → repère du viewBox. `preserveAspectRatio` centre le dessin :
   * on retire le letterboxing puis on divise par l'échelle uniforme.
   * La tolérance (45 px ÉCRAN) est convertie en unités viewBox.
   */
  const toLocal = (e: React.PointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect()
    const scale = Math.min(rect.width / VIEW_W, rect.height / VIEW_H)
    const offX = (rect.width - VIEW_W * scale) / 2
    const offY = (rect.height - VIEW_H * scale) / 2
    return {
      x: (e.clientX - rect.left - offX) / scale,
      y: (e.clientY - rect.top - offY) / scale,
      tolerance: TRACE_TOLERANCE / scale,
    }
  }

  const advance = (e: React.PointerEvent) => {
    if (done) return
    const { x, y, tolerance } = toLocal(e)
    // Cherche, un peu en avant du dernier point validé, l'échantillon le plus
    // proche du doigt. La fenêtre limitée empêche de sauter un repli du zigzag.
    const from = progressRef.current
    const to = Math.min(points.length - 1, from + 14)
    let best = -1
    let bestDist = Infinity
    for (let i = from; i <= to; i++) {
      const dist = Math.hypot(points[i].x - x, points[i].y - y)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    }
    if (best < 0 || bestDist > tolerance) return
    // Hors tolérance, on ne serait pas arrivé ici : le trait s'arrête
    // simplement et reprendra depuis le dernier point valide.

    if (best > progressRef.current) {
      progressRef.current = best
      setProgress(best)
    }
    if (best >= points.length - 2) {
      // Arrivée : le chemin s'illumine, petite récompense.
      progressRef.current = points.length - 1
      setProgress(points.length - 1)
      setDone(true)
      tracing.current = false
      play('sparkle')
      window.setTimeout(() => {
        play('fanfare')
        voice('bravo')
      }, 500)
      bumpProgress('toile')
      window.setTimeout(() => {
        if (level + 1 < LEVELS.length) {
          setLevel(level + 1)
          progressRef.current = 0
          setProgress(0)
          setDone(false)
        } else {
          setScreen('home')
        }
      }, 2800)
    }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (done) return
    const { x, y, tolerance } = toLocal(e)
    const anchor = points[progressRef.current]
    // On (re)démarre en posant le doigt près du dernier point valide.
    if (Math.hypot(anchor.x - x, anchor.y - y) <= tolerance * 1.6) {
      tracing.current = true
      svgRef.current!.setPointerCapture(e.pointerId)
      play('tap')
      advance(e)
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (tracing.current) advance(e)
  }

  const stopTracing = () => {
    tracing.current = false
  }

  // Polyligne du tracé déjà validé.
  const traced = points
    .slice(0, progress + 1)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const end = points[points.length - 1]
  const anchor = points[progress]

  return (
    <div className="zone-jeu relative h-full w-full bg-creme">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="tappable h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopTracing}
        onPointerCancel={stopTracing}
      >
        {/* Chemin en pointillés */}
        <path
          d={d}
          fill="none"
          stroke={COLORS.encre}
          strokeOpacity="0.25"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="2 34"
        />
        {/* Trait dessiné sous le doigt */}
        {progress > 0 && (
          <path
            d={traced}
            fill="none"
            stroke={color}
            strokeWidth={done ? 26 : 18}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={done ? 1 : 0.95}
            style={done ? { filter: `drop-shadow(0 0 14px ${color})` } : undefined}
          />
        )}
        {/* Point d'arrivée */}
        <circle cx={end.x} cy={end.y} r="34" fill={COLORS.encre} opacity="0.3" />
        <circle cx={end.x} cy={end.y} r="20" fill={COLORS.coquille} />
        {/* Point de reprise / départ, pulsant */}
        {!done && (
          <motion.circle
            cx={anchor.x}
            cy={anchor.y}
            r={30}
            fill={color}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            animate={reduced ? { opacity: [0.6, 1, 0.6] } : { scale: [0.85, 1.2, 0.85] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          />
        )}
      </svg>
      {done && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <KapowBurst color={color} />
        </div>
      )}
    </div>
  )
}
