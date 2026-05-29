export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2329',
        canvas: '#f4f6fb',
  accent: {
  DEFAULT: '#3b5bdb',
  soft: '#5c7cfa',
  dark: '#2f4ac9',
},
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['0.9375rem', '1.55'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20, 25, 30, 0.04), 0 1px 3px rgba(20, 25, 30, 0.05)',
        card: '0 1px 2px rgba(20, 25, 30, 0.04), 0 4px 12px rgba(20, 25, 30, 0.04)',
      },
    },
  },
  plugins: [],
}
