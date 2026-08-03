/**
 * Tuile tactile générique : action déclenchée dès le pointerdown (feedback
 * immédiat, < 100 ms), retour visuel par changement d'échelle + son court.
 * Pointer Events uniquement — jamais de onClick.
 */
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useSound } from '../audio/useSound'

interface TileButtonProps {
  onPress: () => void
  children: ReactNode
  className?: string
  disabled?: boolean
  silent?: boolean
}

export function TileButton({ onPress, children, className = '', disabled = false, silent = false }: TileButtonProps) {
  const { play } = useSound()
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={`tappable zone-jeu cursor-pointer select-none ${className}`}
      style={{ minWidth: 90, minHeight: 90 }}
      whileTap={reduced || disabled ? undefined : { scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      onPointerDown={(e) => {
        e.stopPropagation()
        if (disabled) return
        if (!silent) play('tap')
        onPress()
      }}
    >
      {children}
    </motion.div>
  )
}
