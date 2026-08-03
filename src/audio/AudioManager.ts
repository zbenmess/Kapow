/**
 * Gestionnaire de sons — Web Audio API.
 *
 * Tous les effets sont synthétisés à l'oscillateur (zéro fichier, zéro
 * latence). Les voix off sont des fichiers mp3 dans `public/voice/` (liste
 * exacte dans le README) ; tant qu'un fichier manque, un carillon doux à deux
 * notes sert de placeholder pour que l'enfant reçoive quand même un signal.
 *
 * Le contexte audio est créé au premier geste de l'utilisateur (contrainte
 * navigateur), puis les voix sont préchargées et décodées immédiatement.
 */
import type { HeroId } from '../characters/heroes'

export type CueId =
  | 'tap'
  | 'pop'
  | 'whoosh-up'
  | 'whoosh-down'
  | 'magnet'
  | 'fanfare'
  | 'sparkle'
  | `hero-${HeroId}`

export const VOICE_IDS = [
  'accueil',
  'regarde-bien',
  'bravo',
  'memory-intro',
  'envol-intro',
  'boucliers-intro',
  'toile-intro',
  'nom-roc',
  'nom-zoum',
  'nom-alto',
  'nom-givro',
  'nom-volta',
  'nom-mira',
] as const

export type VoiceId = (typeof VOICE_IDS)[number]

class AudioManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noiseBuffer: AudioBuffer | null = null
  private voices = new Map<VoiceId, AudioBuffer>()
  private volume = 0.8
  private currentVoice: AudioBufferSourceNode | null = null

  /** À appeler sur le premier pointerdown de la session. Idempotent. */
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return
    }
    const ctx = new AudioContext()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = this.volume
    this.master.connect(ctx.destination)

    // Bruit blanc pré-rendu pour les whooshs.
    const len = ctx.sampleRate
    this.noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = this.noiseBuffer.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1

    void this.preloadVoices()
  }

  setVolume(v: number) {
    this.volume = v
    if (this.master) this.master.gain.value = v
  }

  private async preloadVoices() {
    if (!this.ctx) return
    await Promise.all(
      VOICE_IDS.map(async (id) => {
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}voice/${id}.mp3`)
          if (!res.ok) return
          const raw = await res.arrayBuffer()
          const buf = await this.ctx!.decodeAudioData(raw)
          this.voices.set(id, buf)
        } catch {
          // Fichier absent : le placeholder synthétique prendra le relais.
        }
      }),
    )
  }

  /** Joue une note simple (fréquences en Hz, temps en secondes). */
  private note(
    freq: number,
    at: number,
    dur: number,
    opts: { type?: OscillatorType; gain?: number; glideTo?: number } = {},
  ) {
    if (!this.ctx || !this.master) return
    const { type = 'sine', gain = 0.5, glideTo } = opts
    const t = this.ctx.currentTime + at
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(gain, t + 0.015)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  }

  private whoosh(at: number, dur: number, from: number, to: number) {
    if (!this.ctx || !this.master || !this.noiseBuffer) return
    const t = this.ctx.currentTime + at
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 1.2
    filter.frequency.setValueAtTime(from, t)
    filter.frequency.exponentialRampToValueAtTime(to, t + dur)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.4, t + 0.05)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    src.connect(filter).connect(g).connect(this.master)
    src.start(t)
    src.stop(t + dur + 0.05)
  }

  /** Effets courts. Jamais de son négatif : une erreur ne joue RIEN. */
  play(cue: CueId) {
    if (!this.ctx) return
    switch (cue) {
      case 'tap':
        this.note(660, 0, 0.07, { type: 'triangle', gain: 0.25 })
        break
      case 'pop':
        this.note(523, 0, 0.09, { type: 'triangle', gain: 0.4 })
        this.note(784, 0.07, 0.12, { type: 'triangle', gain: 0.4 })
        break
      case 'magnet':
        this.note(392, 0, 0.08, { type: 'sine', gain: 0.35, glideTo: 587 })
        break
      case 'whoosh-up':
        this.whoosh(0, 0.6, 300, 2400)
        break
      case 'whoosh-down':
        this.whoosh(0, 0.6, 2400, 300)
        break
      case 'sparkle':
        ;[1047, 1319, 1568, 2093].forEach((f, i) => this.note(f, i * 0.06, 0.18, { gain: 0.22 }))
        break
      case 'fanfare':
        ;[523, 659, 784].forEach((f, i) => this.note(f, i * 0.12, 0.22, { type: 'triangle', gain: 0.4 }))
        this.note(1047, 0.36, 0.5, { type: 'triangle', gain: 0.45 })
        this.play('sparkle')
        break
      case 'hero-roc':
        this.note(131, 0, 0.25, { type: 'square', gain: 0.3 })
        this.note(98, 0.18, 0.35, { type: 'square', gain: 0.3 })
        break
      case 'hero-zoum':
        ;[523, 659, 784, 1047].forEach((f, i) => this.note(f, i * 0.05, 0.1, { type: 'triangle', gain: 0.32 }))
        break
      case 'hero-alto':
        this.note(392, 0, 0.5, { type: 'sine', gain: 0.35, glideTo: 784 })
        break
      case 'hero-givro':
        this.note(880, 0, 0.3, { type: 'sine', gain: 0.28 })
        this.note(1320, 0.1, 0.35, { type: 'sine', gain: 0.22 })
        break
      case 'hero-volta':
        this.note(196, 0, 0.18, { type: 'sawtooth', gain: 0.22, glideTo: 1175 })
        break
      case 'hero-mira':
        this.note(660, 0, 0.55, { type: 'sine', gain: 0.3, glideTo: 330 })
        break
    }
  }

  /** Voix off. Une seule voix à la fois : la nouvelle coupe la précédente. */
  voice(id: VoiceId) {
    if (!this.ctx || !this.master) return
    if (this.currentVoice) {
      try {
        this.currentVoice.stop()
      } catch {
        /* déjà arrêtée */
      }
      this.currentVoice = null
    }
    const buf = this.voices.get(id)
    if (buf) {
      const src = this.ctx.createBufferSource()
      src.buffer = buf
      src.connect(this.master)
      src.start()
      this.currentVoice = src
    } else {
      // Placeholder : carillon doux à deux notes.
      this.note(587, 0, 0.15, { type: 'triangle', gain: 0.3 })
      this.note(880, 0.15, 0.3, { type: 'triangle', gain: 0.3 })
    }
  }
}

export const audio = new AudioManager()
