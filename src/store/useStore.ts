/**
 * État global — Zustand.
 *
 * Réglages et progression sont persistés dans localStorage uniquement :
 * aucune donnée ne quitte l'appareil, aucun tracking, aucune requête réseau.
 * La navigation (écran courant) est volontairement non persistée : au
 * lancement, l'app s'ouvre toujours sur l'accueil.
 *
 * DIFFICULTÉ ADAPTATIVE : chaque jeu a un niveau (0 → MAX_LEVEL). Deux
 * manches réussies sans accroc → un cran de plus ; deux manches laborieuses
 * d'affilée → un cran de moins, en douceur. Rien n'est montré à l'enfant :
 * le jeu devient simplement un peu plus riche ou un peu plus simple.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audio } from '../audio/AudioManager'

export type GameId = 'memory' | 'envol' | 'boucliers' | 'toile' | 'intrus' | 'echo'
export type Screen = 'home' | GameId

export const GAME_IDS: GameId[] = ['memory', 'envol', 'boucliers', 'toile', 'intrus', 'echo']

/** Niveau maximal par jeu (le niveau 0 est celui d'un enfant de 3 ans pile). */
export const MAX_LEVEL: Record<GameId, number> = {
  memory: 6,
  envol: 3,
  boucliers: 3,
  toile: 6,
  intrus: 2,
  echo: 2,
}

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

  // — progression adaptative (persistée)
  levels: Record<GameId, number>
  ups: Record<GameId, number>
  downs: Record<GameId, number>
  /** À appeler après chaque manche : la difficulté s'ajuste en silence. */
  reportRound: (g: GameId, struggled: boolean) => void
  /** Préréglage parent : niveau de départ pour tous les jeux (0, 1 ou 2). */
  setBaseLevel: (base: number) => void
  resetProgress: () => void
}

const ZERO: Record<GameId, number> = { memory: 0, envol: 0, boucliers: 0, toile: 0, intrus: 0, echo: 0 }

const ALL_ENABLED: Record<GameId, boolean> = {
  memory: true,
  envol: true,
  boucliers: true,
  toile: true,
  intrus: true,
  echo: true,
}

export const useStore = create<KapowState>()(
  persist(
    (set, get) => ({
      screen: 'home',
      parentOpen: false,
      setScreen: (screen) => set({ screen }),
      setParentOpen: (parentOpen) => set({ parentOpen }),

      volume: 0.8,
      enabledGames: { ...ALL_ENABLED },
      setVolume: (volume) => {
        audio.setVolume(volume)
        set({ volume })
      },
      toggleGame: (g) =>
        set({ enabledGames: { ...get().enabledGames, [g]: !get().enabledGames[g] } }),

      levels: { ...ZERO },
      ups: { ...ZERO },
      downs: { ...ZERO },
      reportRound: (g, struggled) => {
        const { levels, ups, downs } = get()
        let level = levels[g]
        let up = ups[g]
        let down = downs[g]
        if (struggled) {
          up = 0
          down += 1
          if (down >= 2) {
            level = Math.max(0, level - 1)
            down = 0
          }
        } else {
          down = 0
          up += 1
          if (up >= 2) {
            level = Math.min(MAX_LEVEL[g], level + 1)
            up = 0
          }
        }
        set({
          levels: { ...levels, [g]: level },
          ups: { ...ups, [g]: up },
          downs: { ...downs, [g]: down },
        })
      },
      setBaseLevel: (base) => {
        const levels = { ...ZERO }
        for (const g of GAME_IDS) levels[g] = Math.min(MAX_LEVEL[g], base)
        set({ levels, ups: { ...ZERO }, downs: { ...ZERO } })
      },
      resetProgress: () => set({ levels: { ...ZERO }, ups: { ...ZERO }, downs: { ...ZERO } }),
    }),
    {
      name: 'kapow',
      version: 2,
      partialize: (s) => ({
        volume: s.volume,
        enabledGames: s.enabledGames,
        levels: s.levels,
        ups: s.ups,
        downs: s.downs,
      }),
      migrate: (persisted: unknown, version) => {
        // v1 stockait des compteurs de parties : on repart sur des niveaux
        // propres en conservant volume et jeux activés.
        const p = (persisted ?? {}) as Partial<KapowState>
        if (version < 2) {
          return {
            volume: p.volume ?? 0.8,
            enabledGames: { ...ALL_ENABLED, ...(p.enabledGames ?? {}) },
            levels: { ...ZERO },
            ups: { ...ZERO },
            downs: { ...ZERO },
          }
        }
        return {
          volume: p.volume ?? 0.8,
          enabledGames: { ...ALL_ENABLED, ...(p.enabledGames ?? {}) },
          levels: { ...ZERO, ...(p.levels ?? {}) },
          ups: { ...ZERO, ...(p.ups ?? {}) },
          downs: { ...ZERO, ...(p.downs ?? {}) },
        }
      },
      onRehydrateStorage: () => (state) => {
        if (state) audio.setVolume(state.volume)
      },
    },
  ),
)

/** Nombre d'étoiles Kapow (0 à 5) affichées sur la tuile d'accueil d'un jeu. */
export function starsFor(game: GameId, level: number): number {
  return Math.round((level / MAX_LEVEL[game]) * 5)
}
