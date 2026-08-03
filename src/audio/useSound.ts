import { useCallback } from 'react'
import { audio, type CueId, type VoiceId } from './AudioManager'

/** Accès stable au gestionnaire de sons depuis les composants. */
export function useSound() {
  const play = useCallback((cue: CueId) => audio.play(cue), [])
  const voice = useCallback((id: VoiceId) => audio.voice(id), [])
  return { play, voice }
}
