/**
 * Panneau parent : volume, choix des jeux disponibles, remise à zéro de la
 * progression. Seul endroit de l'app où du texte est affiché — il est
 * destiné à l'adulte, jamais à l'enfant.
 */
import { useState } from 'react'
import { GAME_IDS, useStore, type GameId } from '../store/useStore'
import { useSound } from '../audio/useSound'

const GAME_LABELS: Record<GameId, string> = {
  memory: 'Memory des emblèmes',
  envol: "Qui s'est envolé ?",
  boucliers: 'Chaque héros son bouclier',
  toile: 'La toile',
  intrus: "L'intrus",
  echo: "L'écho Kapow",
}

export function ParentPanel() {
  const { volume, setVolume, enabledGames, toggleGame, resetProgress, setBaseLevel, setParentOpen } =
    useStore()
  const { play } = useSound()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-encre/60">
      <div className="w-[min(560px,90vw)] max-h-[90vh] overflow-y-auto rounded-blob bg-coquille p-8 font-display text-encre shadow-flottant">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold">Espace parent</h2>
          <button
            className="tappable h-14 w-14 rounded-full bg-creme text-2xl font-bold shadow-pose active:scale-90"
            onPointerDown={() => setParentOpen(false)}
          >
            ✕
          </button>
        </div>

        <section className="mb-6">
          <h3 className="mb-2 text-xl font-bold">Volume</h3>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            className="w-full accent-[#E8603D]"
            onChange={(e) => setVolume(Number(e.target.value))}
            onPointerUp={() => play('pop')}
          />
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-xl font-bold">Jeux disponibles</h3>
          <div className="flex flex-col gap-2">
            {GAME_IDS.map((g) => (
              <label key={g} className="flex items-center justify-between rounded-3xl bg-creme px-5 py-3 text-lg font-semibold">
                {GAME_LABELS[g]}
                <button
                  className={`tappable h-9 w-16 rounded-full p-1 transition-colors ${enabledGames[g] ? 'bg-roc' : 'bg-encre/20'}`}
                  onPointerDown={() => toggleGame(g)}
                >
                  <div
                    className={`h-7 w-7 rounded-full bg-coquille shadow-pose transition-transform ${enabledGames[g] ? 'translate-x-7' : ''}`}
                  />
                </button>
              </label>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="mb-1 text-xl font-bold">Niveau de départ</h3>
          <p className="mb-2 text-sm opacity-70">
            La difficulté s'ajuste ensuite toute seule, en douceur, selon les réussites.
          </p>
          <div className="flex gap-3">
            {[
              { label: 'Doux (3 ans)', base: 0 },
              { label: 'Moyen (3 ans ½)', base: 1 },
              { label: 'Costaud (4 ans)', base: 2 },
            ].map(({ label, base }) => (
              <button
                key={base}
                className="tappable rounded-3xl bg-creme px-5 py-2 text-lg font-bold shadow-pose active:scale-95"
                onPointerDown={() => setBaseLevel(base)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xl font-bold">Progression</h3>
          {confirmReset ? (
            <div className="flex items-center gap-3">
              <span className="text-lg">Tout effacer ?</span>
              <button
                className="tappable rounded-3xl bg-alto px-5 py-2 text-lg font-bold text-coquille shadow-pose active:scale-95"
                onPointerDown={() => {
                  resetProgress()
                  setConfirmReset(false)
                }}
              >
                Oui, remettre à zéro
              </button>
              <button
                className="tappable rounded-3xl bg-creme px-5 py-2 text-lg font-bold shadow-pose active:scale-95"
                onPointerDown={() => setConfirmReset(false)}
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              className="tappable rounded-3xl bg-creme px-5 py-2 text-lg font-bold shadow-pose active:scale-95"
              onPointerDown={() => setConfirmReset(true)}
            >
              Remettre la progression à zéro
            </button>
          )}
        </section>
      </div>
    </div>
  )
}
