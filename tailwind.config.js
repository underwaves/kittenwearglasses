/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/client/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coquette: {
          bgBlue: '#CBE0EE',       // Soft Crystal Blue stripe (#A6C9DD lightened for airy contrast)
          crystalBlue: '#A6C9DD',  // Crystal Blue
          bgCream: '#FAF6F0',      // True Soft Cream (replaces Lemon Icing #FFF8D5)
          rose: '#68002C',         // Beet Red (Primary headings & buttons)
          roseDark: '#4D0020',     // Darker Beet Red for hover
          roseLight: '#E098AC',    // Sea Pink (Borders, ribbons, soft accents)
          roseBg: '#F7E8EC',       // Soft Sea Pink tint
          clover: '#CDE8A8',       // Pastel Clover Green
          cloverDark: '#5E8B34',
          priceBlue: '#DFEEF7',    // Soft Crystal Blue fill for price boxes
          priceBorder: '#A6C9DD',  // Crystal Blue border
          brown: '#441910',        // Rum Raisin (Body text)
          brownMuted: '#784F46',   // Muted Rum Raisin
          crimson: '#68002C',      // Beet Red
        },
        // Centralized Brand Exceptions (documenting external partner brand identity)
        line: {
          DEFAULT: '#06C755',      // Official LINE OA green
          hover: '#05A948',
        },
        status: {
          openBg: '#EEF9E1',
          openBorder: '#B4DE81',
          openText: '#3B6218',
          openDot: '#5E8B34',
          fillingBg: '#FFFDF4',
          fillingBorder: '#F5E08E',
          fillingText: '#7A5800',
          fillingDot: '#E5A000',
        },
      },
      fontFamily: {
        prompt: ['"Prompt"', 'sans-serif'],
        thai: ['"Prompt"', '"Noto Sans Thai Looped"', 'sans-serif'],
        script: ['"Pinyon Script"', 'cursive'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'coquette': '0 10px 28px -6px rgba(104, 0, 44, 0.14), 0 4px 10px -2px rgba(224, 152, 172, 0.16)',
        'coquette-sm': '0 4px 14px -2px rgba(104, 0, 44, 0.1)',
        'coquette-lg': '0 20px 44px -8px rgba(104, 0, 44, 0.2), 0 8px 16px -4px rgba(224, 152, 172, 0.18)',
        'coquette-inner': 'inset 0 0 0 4px rgba(253, 251, 247, 0.92)',
      },
      animation: {
        'sparkle': 'sparkle 2.4s ease-in-out infinite',
        'float': 'float 3.5s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        sparkle: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.22) rotate(12deg)', opacity: '0.75' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(0.96)' },
        }
      }
    },
  },
  plugins: [],
}
