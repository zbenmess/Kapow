/**
 * État global — Zustand.
 *
 * Réglages et progression sont persistés dans localStorage uniquement :
 * aucune donnée ne quitte l'appareil, aucun tracking, aucune requête réseau.
 * La navigation (écran courant) est volontairement non persistée : au
 * lancement, l'app s'ouvre toujours sur l'accueil.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audio } from '../audio/AudioManager'

export type GameId = 'memory' | 'envol' | 'boucliers' | 'toile'
export type Screen = 'home' | GameId

export const GAME_IDS: GameId[] = ['memory', 'envol', 'boucliers', 'toile']

interface KapowState {
  // — navigation (non persistée)
  screen: Screen
  parentOpen: boolean
  setScreen: (s: Screen) => void
  setParentOpen: (open: boolean) => void

  // — réglages parent (persistés)
  volume: number
  enabledGames: Record<GameId, boolean>
  setVolume: (v: number) => void
  toggleGame: (g: GameId) => void

  // — progression (persistée) : niveau atteint par jeu
  progress: Record<GameId, number>
  bumpProgress: (g: GameId) => void
  resetProgress: () => void
}

const ZERO_PROGRESS: Record<GameId, number> = { memory: 0, envol: 0, boucliers: 0, toile: 0 }

export const useStore = create<KapowState>()(
  persist(
    (set, get) => ({
      screen: 'home',
      parentOpen: false,
      setScreen: (screen) => set({ screen }),
      setParentOpen: (parentOpen) => set({ parentOpen }),

      volume: 0.8,
      enabledGames: { memory: true, envol: true, boucliers: true, toile: true },
      setVolume: (volume) => {
        audio.setVolume(volume)
        set({ volume })
      },
      toggleGame: (g) =>
        set({ enabledGames: { ...get().enabledGames, [g]: !get().enabledGames[g] } }),

      progress: { ...ZERO_PROGRESS },
      bumpProgress: (g) => set({ progress: { ...get().progress, [g]: get().progress[g] + 1 } }),
      resetProgress: () => set({ progress: { ...ZERO_PROGRESS } }),
    }),
    {
      name: 'kapow',
      partialize: (s) => ({ volume: s.volume, enabledGames: s.enabledGames, progress: s.progress }),
      onRehydrateStorage: () => (state) => {
        if (state) audio.setVolume(state.volume)
      },
    },
  ),
)
