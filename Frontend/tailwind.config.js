/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      accentColor: {
        'blue-500': '#3b82f6',
        'blue-600': '#2563eb',
        'green-500': '#10b981',
        'green-600': '#059669',
        'red-500': '#ef4444',
        'red-600': '#dc2626',
        'purple-500': '#8b5cf6',
        'purple-600': '#7c3aed',
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark"],
  },
}

