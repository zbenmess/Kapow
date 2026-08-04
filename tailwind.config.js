/**
 * KAPOW — Système de tokens
 * =========================
 * Palette « Goûter d'orage » : 6 teintes saturées mais chaudes, une par héros,
 * posées sur un fond crème. Pas de dégradé bleu-violet, pas de blanc froid.
 * Chaque couleur porte le nom de son héros — le code parle la langue de l'univers.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Teintes des héros
        roc: '#4EAD6E', // vert prairie — Roc, la force
        zoum: '#EF5D8E', // rose framboise — Zoum, la vitesse
        alto: '#E8603D', // corail — Alto, le vol
        givro: '#45A8DC', // bleu glacier — Givro, la glace
        volta: '#F5B531', // jaune miel — Volta, la foudre
        mira: '#8A6BC9', // violet myrtille — Mira, l'invisibilité
        braise: '#C9404F', // rouge cerise — Braise, le feu
        onda: '#2FB4A8', // vert lagon — Onda, l'eau
        // Neutres
        creme: '#FFF6E9', // fond unique de toute l'app
        encre: '#35365C', // indigo doux : traits, ombres, texte parent
        coquille: '#FFFDF7', // surface des cartes
      },
      fontFamily: {
        // Police d'affichage — interface parent UNIQUEMENT (l'enfant ne voit aucun texte)
        display: ['Baloo 2', 'Comic Sans MS', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        blob: '2.5rem', // arrondi signature des tuiles et cartes
      },
      boxShadow: {
        // Ombres portées douces, jamais de bordure fine
        pose: '0 10px 24px -8px rgba(53, 54, 92, 0.28)',
        flottant: '0 18px 40px -12px rgba(53, 54, 92, 0.35)',
      },
    },
  },
  plugins: [],
}
