/**
 * Chaque héros son bouclier — drag & drop.
 *
 * Trois héros à gauche, trois boucliers assortis à droite (ordre mélangé).
 * Le héros suit le doigt avec une légère inertie (ressort). Aimantation dès
 * que son centre entre dans un rayon de 80 px du bon bouclier (zone ≥ 160 px).
 * Relâché ailleurs : retour fluide à sa place, sans pénalité.
 *
 * Pointer Events exclusivement, avec setPointerCapture pendant le drag.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { HERO_IDS, type HeroId } from '../../characters/heroes'
import { Hero } from '../../components/Hero'
import { Shield } from '../../components/Shield'
import { KapowBurst } from '../../components/KapowBurst'
import { DROP_ZONE_MIN, MAGNET_RADIUS } from '../../design/tokens'
import { useSound } from '../../audio/useSound'
import { useStore } from '../../store/useStore'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface DraggableProps {
  hero: HeroId
  placed: boolean
  onPlaced: (hero: HeroId) => void
  getTargetCenter: (hero: HeroId) => { x: number; y: number } | null
}

function DraggableHero({ hero, placed, onPlaced, getTargetCenter }: DraggableProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  // Le ressort crée la légère inertie : le héros « court après » le doigt.
  const sx = useSpring(x, { stiffness: 550, damping: 35 })
  const sy = useSpring(y, { stiffness: 550, damping: 35 })
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const { play } = useSound()

  const onPointerDown = (e: React.PointerEvent) => {
    if (placed || drag.current) return
    e.stopPropagation()
    const rect = ref.current!.getBoundingClientRect()
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      // Centre « au repos » : centre visuel moins l'offset courant du ressort.
      originX: rect.left + rect.width / 2 - sx.get(),
      originY: rect.top + rect.height / 2 - sy.get(),
    }
    ref.current!.setPointerCapture(e.pointerId)
    setDragging(true)
    play('tap')
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || placed) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    x.set(dx)
    y.set(dy)
    // Aimantation : le centre du héros entre dans le rayon du bon bouclier.
    const target = getTargetCenter(hero)
    if (target) {
      const cx = d.originX + dx
      const cy = d.originY + dy
      if (Math.hypot(cx - target.x, cy - target.y) < MAGNET_RADIUS) {
        drag.current = null
        setDragging(false)
        try {
          ref.current!.releasePointerCapture(e.pointerId)
        } catch {
          /* capture déjà levée */
        }
        x.set(target.x - d.originX)
        y.set(target.y - d.originY)
        play('magnet')
        window.setTimeout(() => play(`hero-${hero}`), 180)
        onPlaced(hero)
      }
    }
  }

  const endDrag = () => {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    // Relâché hors zone : retour fluide à sa place, sans pénalité.
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className="tappable zone-jeu cursor-grab"
      style={{ x: sx, y: sy, zIndex: dragging ? 30 : placed ? 20 : 10, position: 'relative' }}
      animate={{ scale: dragging ? 1.12 : placed ? 0.82 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <Hero hero={hero} size={140} />
    </motion.div>
  )
}

export function ShieldsGame() {
  const [trios] = useState<HeroId[][]>(() => {
    const all = shuffle(HERO_IDS)
    return [all.slice(0, 3), all.slice(3, 6)]
  })
  const [trioIndex, setTrioIndex] = useState(0)
  const [shieldOrder, setShieldOrder] = useState<HeroId[]>(() => shuffle(trios[0]))
  const [placed, setPlaced] = useState<Set<HeroId>>(new Set())
  const [celebrating, setCelebrating] = useState(false)
  const shieldRefs = useRef(new Map<HeroId, HTMLDivElement>())
  const { play, voice } = useSound()
  const { setScreen, bumpProgress } = useStore()

  useEffect(() => {
    voice('boucliers-intro')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const trio = trios[trioIndex]

  const getTargetCenter = (hero: HeroId) => {
    const el = shieldRefs.current.get(hero)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  const onPlaced = (hero: HeroId) => {
    setPlaced((p) => {
      const np = new Set(p)
      np.add(hero)
      return np
    })
  }

  useEffect(() => {
    if (placed.size === 3 && !celebrating) {
      setCelebrating(true)
      bumpProgress('boucliers')
      window.setTimeout(() => {
        play('fanfare')
        voice('bravo')
      }, 500)
      window.setTimeout(() => {
        if (trioIndex + 1 < trios.length) {
          const next = trios[trioIndex + 1]
          setTrioIndex(trioIndex + 1)
          setShieldOrder(shuffle(next))
          setPlaced(new Set())
          setCelebrating(false)
        } else {
          setScreen('home')
        }
      }, 2800)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed])

  return (
    <div className="zone-jeu relative flex h-full w-full items-center justify-between bg-creme px-[8vw]">
      {/* Héros à gauche */}
      <div key={`heroes-${trioIndex}`} className="flex flex-col justify-center gap-8">
        {trio.map((hero) => (
          <DraggableHero
            key={hero}
            hero={hero}
            placed={placed.has(hero)}
            onPlaced={onPlaced}
            getTargetCenter={getTargetCenter}
          />
        ))}
      </div>

      {/* Boucliers à droite — zones de dépôt ≥ 160 px */}
      <div key={`shields-${trioIndex}`} className="flex flex-col justify-center gap-8">
        {shieldOrder.map((hero) => (
          <div
            key={hero}
            ref={(el) => {
              if (el) shieldRefs.current.set(hero, el)
              else shieldRefs.current.delete(hero)
            }}
            className={placed.has(hero) ? 'opacity-90' : ''}
          >
            <Shield hero={hero} size={DROP_ZONE_MIN} />
          </div>
        ))}
      </div>

      {celebrating && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <KapowBurst color="#4EAD6E" />
        </div>
      )}
    </div>
  )
}
