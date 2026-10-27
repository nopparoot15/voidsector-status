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
      },
      animation: { ping2: 'ping2 2s ease-out infinite', floaty: 'floaty 5s ease-in-out infinite', drift: 'drift 16s ease-in-out infinite' },
    },
  },
};
