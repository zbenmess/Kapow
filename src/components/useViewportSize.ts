import { useEffect, useState } from 'react'

/**
 * Dimensions du viewport, mises à jour au redimensionnement / rotation.
 * Sert à adapter les tailles des éléments de jeu aux écrans moins hauts
 * qu'une tablette (téléphones en paysage) sans jamais couper le contenu.
 */
export function useViewportSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])
  return size
}

/** Borne une valeur entre un minimum et un maximum. */
export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
