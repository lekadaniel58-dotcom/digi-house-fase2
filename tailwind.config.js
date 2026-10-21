/** Colori stimati dal logo Digi House (blu notte e oro): da rifinire con i valori esatti del brand */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { navy: { DEFAULT: '#1D1C3B', 700: '#2A2957', 50: '#F1F1F7' }, gold: { DEFAULT: '#B8892B', 600: '#9C7322', 100: '#F6EBCF' } },
    fontFamily: { display: ['"Archivo Black"', 'Impact', 'system-ui', 'sans-serif'] } } },
  plugins: [],
};
