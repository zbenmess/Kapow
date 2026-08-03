/**
 * Accès parent : point discret en bas à droite de l'accueil.
 * Appui long de 3 s → addition à deux chiffres → panneau parent.
 * Un enfant de 3 ans ne peut ni maintenir 3 s volontairement au même
 * endroit, ni résoudre l'addition : double verrou.
 */
import { useEffect, useRef, useState } from 'react'
import { PARENT_HOLD_MS } from '../design/tokens'
import { useStore } from '../store/useStore'

function twoDigit() {
  return 12 + Math.floor(Math.random() * 76)
}

export function ParentGate() {
  const setParentOpen = useStore((s) => s.setParentOpen)
  const [challenge, setChallenge] = useState<{ a: number; b: number } | null>(null)
  const [entry, setEntry] = useState('')
  const [shake, setShake] = useState(false)
  const timer = useRef<number | null>(null)

  const cancelHold = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }
  useEffect(() => cancelHold, [])

  const digit = (d: string) => {
    if (!challenge) return
    const next = (entry + d).slice(0, 3)
    setEntry(next)
    if (next.length >= String(challenge.a + challenge.b).length) {
      if (Number(next) === challenge.a + challenge.b) {
        setChallenge(null)
        setEntry('')
        setParentOpen(true)
      } else {
        setShake(true)
        window.setTimeout(() => {
          setEntry('')
          setShake(false)
        }, 400)
      }
    }
  }

  return (
    <>
      {/* Le point discret — appui long 3 s */}
      <div
        className="tappable zone-jeu absolute bottom-2 right-2 z-40 h-[64px] w-[64px] rounded-full"
        onPointerDown={(e) => {
          e.stopPropagation()
          cancelHold()
          timer.current = window.setTimeout(() => {
            setChallenge({ a: twoDigit(), b: twoDigit() })
            setEntry('')
          }, PARENT_HOLD_MS)
        }}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
      >
        <div className="absolute bottom-5 right-5 h-2.5 w-2.5 rounded-full bg-encre opacity-20" />
      </div>

      {/* L'addition de contrôle */}
      {challenge && (
        <div
          className="tappable zone-jeu absolute inset-0 z-50 flex items-center justify-center bg-encre/60"
          onPointerDown={() => {
            setChallenge(null)
            setEntry('')
          }}
        >
          <div
            className={`rounded-blob bg-coquille p-8 shadow-flottant ${shake ? 'animate-pulse' : ''}`}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-center font-display text-4xl font-extrabold text-encre">
              {challenge.a} + {challenge.b} = {entry || '?'}
            </p>
            <div className="grid grid-cols-5 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
                <button
                  key={d}
                  className="tappable h-16 w-16 rounded-3xl bg-creme font-display text-3xl font-bold text-encre shadow-pose active:scale-90"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    digit(d)
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
