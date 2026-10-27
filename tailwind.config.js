/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/page.html'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', '"Noto Sans Thai"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'] },
      colors: { vs: { bg: '#07070f', surface: '#0c0c18', card: '#131420', line: '#1e1f32' } },
      keyframes: {
        ping2: { '0%': { transform: 'scale(.6)', opacity: '.7' }, '100%': { transform: 'scale(1.9)', opacity: '0' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        drift: { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(24px,-18px,0)' } },
        drift2: { '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' }, '50%': { transform: 'translate3d(-40px,26px,0) scale(1.12)' } },
        fadeup: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '200% 50%' } },
        sweep: { '0%': { transform: 'translateX(-130%) skewX(-18deg)' }, '55%,100%': { transform: 'translateX(330%) skewX(-18deg)' } },
      },
      animation: { ping2: 'ping2 2s ease-out infinite', floaty: 'floaty 5s ease-in-out infinite', drift: 'drift 16s ease-in-out infinite', drift2: 'drift2 21s ease-in-out infinite', fadeup: 'fadeup .8s cubic-bezier(.2,.7,.2,1) backwards', shimmer: 'shimmer 6s linear infinite', sweep: 'sweep 4.5s ease-in-out infinite' },
    },
  },
};
