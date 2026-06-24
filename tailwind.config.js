/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: { xs: "480px" },
      colors: {
        // custom brand color extensions
        "gray-150": "#ECEEF2",
      },
      transitionDuration: {
        DEFAULT: "250ms",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["active"],
    },
  },

  daisyui: {
    logs: false,
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=light]"],
          primary: "#4F46E5", // Indigo
          "tableHeaderbg": "#818CF8",
          "primary-content": "#FFFFFF",
          secondary: "#0F172A", // Slate
          accent: "#10B981", // Emerald
          neutral: "#E0E7FF",
          "base-100": "#FFFFFF",
          "base-200": "#F3F4F6",
          "base-300": "#E5E7EB",
          info: "#3B82F6",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          black: "#000000",
        },
      },
      {
        dark: {
          ...require("daisyui/src/theming/themes")["[data-theme=dark]"],
          primary: "#6366F1", // Indigo 500
          "primary-content": "#E0E7FF",
          secondary: "#1E293B", // Dark Slate
          accent: "#34D399", // Mint/Emerald
          neutral: "#1E293B",
          "base-100": "#0F172A", // Deep Dark Slate
          "base-200": "#1E293B",
          "base-300": "#334155",
          info: "#60A5FA",
          success: "#34D399",
          warning: "#FBBF24",
          error: "#F87171",
        },
      },
    ],
  },

  plugins: [require("daisyui")],
}
