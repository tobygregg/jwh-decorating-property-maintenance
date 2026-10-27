/** ============================================================
 *  Tailwind config — JWH Decorating & Property Maintenance
 *  Brand colours + fonts live here. Change them once, rebuild
 *  (npm run build) and the whole site updates.
 *  ============================================================ */
module.exports = {
  content: ['./index.html', './thanks.html', './404.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        // Logo blue — the top-left end of the gradient on the JWH badge
        jwhblue: {
          DEFAULT: '#0A4FC2',
          dark: '#083E99',
          light: '#E8EFFB',
        },
        // Logo green — the bottom-right end of the badge gradient
        jwhgreen: {
          DEFAULT: '#00A940',
          dark: '#00813A', // darker shade so white text passes contrast
          light: '#E6F5EC',
        },
        // Mid-point of the badge gradient, where blue turns to green
        teal: '#01866F',
        // Text + dark panels — near-black green, from the badge outline
        ink: {
          DEFAULT: '#12231F',
          800: '#1C312C',
          700: '#2C4540',
        },
        muted: '#53635F', // body text on light backgrounds
        // "Primer" off-white for light sections — a freshly undercoated wall
        primer: {
          DEFAULT: '#F6F5F0',
          dark: '#ECEAE2',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '1200px',
      },
      backgroundImage: {
        // The JWH badge gradient — used on buttons, the roller sleeve and accents
        badge: 'linear-gradient(120deg, #0A4FC2 0%, #01866F 55%, #00A940 100%)',
        'badge-btn': 'linear-gradient(120deg, #0A4FC2 0%, #00813A 100%)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,35,31,.06), 0 18px 40px -24px rgba(18,35,31,.35)',
        lift: '0 2px 4px rgba(18,35,31,.06), 0 28px 50px -26px rgba(18,35,31,.45)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'none' } },
        stroke: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
      animation: {
        'fade-up': 'fade-up .8s cubic-bezier(.2,.7,.2,1) both',
        stroke: 'stroke .9s cubic-bezier(.65,0,.35,1) both',
      },
    },
  },
  plugins: [],
};
