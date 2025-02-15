export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#006400',
        secondary: '#f3f4f6',
        accent: '#60a5fa',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        hukpoly: {
          "primary": "#006400",
          "secondary": "#1e40af",
          "accent": "#60a5fa",
          "neutral": "#2a323c",
          "base-100": "#f3f4f6",
        },
      },
    ],
  },
}