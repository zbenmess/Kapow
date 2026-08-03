/**
 * L'étoile Kapow — signature visuelle de l'app.
 * Splash de BD à huit lobes tout en courbes qui éclate derrière chaque
 * réussite. Avec `prefers-reduced-motion`, l'éclat devient un simple fondu.
 */
import { motion, useReducedMotion } from 'framer-motion'

/** Trace le splash : 8 pointes arrondies reliées par des courbes. */
function burstPath(outer: number, inner: number): string {
  const pts: string[] = []
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i * Math.PI) / 8 - Math.PI / 2
    pts.push(`${100 + r * Math.cos(a)} ${100 + r * Math.sin(a)}`)
  }
  let d = `M ${pts[0]}`
  for (let i = 1; i < 16; i += 2) d += ` Q ${pts[i]} ${pts[(i + 1) % 16]}`
  return d + ' Z'
}

const OUTER = burstPath(96, 58)
const INNER = burstPath(70, 44)

export function KapowBurst({ color = '#F5B531', size = 240 }: { color?: string; size?: number }) {
  const reduced = useReducedMotion()
  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden="true"
      initial={reduced ? { opacity: 0 } : { scale: 0.2, rotate: -20, opacity: 0 }}
      animate={reduced ? { opacity: [0, 1, 0] } : { scale: [0.2, 1.15, 1], rotate: 0, opacity: [0, 1, 1, 0] }}
      transition={{ duration: reduced ? 0.6 : 0.9, ease: 'easeOut', times: [0, 0.3, 0.7, 1] }}
    >
      <path d={OUTER} fill={color} opacity="0.9" />
      <path d={INNER} fill="#FFFDF7" opacity="0.85" />
    </motion.svg>
  )
}
