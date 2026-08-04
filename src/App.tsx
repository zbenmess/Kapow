/**
 * Racine de l'app : navigation entre l'accueil et les quatre jeux,
 * initialisation de l'audio au premier geste, garde d'orientation paysage,
 * panneau parent.
 */
import { useEffect, useState } from 'react'
import { audio } from './audio/AudioManager'
import { BackButton } from './components/BackButton'
import { Home } from './Home'
import { MemoryGame } from './games/memory/MemoryGame'
import { FlyAwayGame } from './games/envol/FlyAwayGame'
import { ShieldsGame } from './games/boucliers/ShieldsGame'
import { WebTraceGame } from './games/toile/WebTraceGame'
import { OddOneOutGame } from './games/intrus/OddOneOutGame'
import { EchoGame } from './games/echo/EchoGame'
import { ParentPanel } from './parent/ParentPanel'
import { useStore } from './store/useStore'

/** Pictogramme « tourne la tablette » — montré si l'appareil est en portrait. */
function RotateOverlay() {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-creme">
      <svg viewBox="0 0 100 100" width="180" height="180" aria-hidden="true">
        <rect x="30" y="14" width="40" height="66" rx="10" fill="none" stroke="#35365C" strokeWidth="7" />
        <path
          d="M14 54 a 38 38 0 0 1 18 -32"
          fill="none"
          stroke="#E8603D"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path d="M10 42 L14 56 L27 48 Z" fill="#E8603D" />
      </svg>
    </div>
  )
}

export default function App() {
  const screen = useStore((s) => s.screen)
  const parentOpen = useStore((s) => s.parentOpen)
  const [portrait, setPortrait] = useState(false)

  // L'audio ne peut démarrer qu'après un geste : premier pointerdown.
  useEffect(() => {
    const unlock = () => audio.init()
    window.addEventListener('pointerdown', unlock)
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  // Garde paysage : en portrait, un pictogramme demande de tourner l'écran.
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const update = () => setPortrait(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden bg-creme">
      {screen === 'home' && <Home />}
      {screen === 'memory' && <MemoryGame />}
      {screen === 'envol' && <FlyAwayGame />}
      {screen === 'boucliers' && <ShieldsGame />}
      {screen === 'toile' && <WebTraceGame />}
      {screen === 'intrus' && <OddOneOutGame />}
      {screen === 'echo' && <EchoGame />}
      {screen !== 'home' && <BackButton />}
      {parentOpen && <ParentPanel />}
      {portrait && <RotateOverlay />}
    </div>
  )
}
