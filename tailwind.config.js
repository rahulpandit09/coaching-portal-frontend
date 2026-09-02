/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: { xs: "480px" },
      colors: {
        // custom brand color extensions
        "gray-150": "#ECEEF2",
        loginNavy: "#0f172a",
        loginNavyDark: "#020617",
        loginBlue: "#2563eb",
        loginBlueLight: "#dbeafe",
        loginBlueDark: "#1d4ed8",
        loginIndigo: "#4338ca",
        loginInput: "#f8fafc",
        loginBorder: "#e2e8f0",
        loginMutedLight: "#94a3b8",
        loginMuted: "#64748b",
        loginMutedDark: "#475569",
        loginTextDark: "#334155",
        loginText: "#0f172a",
        loginErrorBg: "#fef2f2",
        loginErrorBorder: "#fecaca",
        loginError: "#ef4444",
        loginErrorText: "#dc2626",
        loginWhite: "#ffffff",
        loginBlack: "#000000",
        darkBlue: "#1A619E",
        background: "#edfcff", // Replace with your desired dark blue shade
      },
      transitionDuration: {
        DEFAULT: "250ms",
      },
    },
  },
  variants: {
    // backgroundColor: ["active"],
    extend: {
      backgroundColor: ["active"],
    },
  },

  // daisyUI config (optional - here are the default values)
  daisyui: {
    logs: false,
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=light]"],
          // primary: "#0084A1",
          //  bg-[#0B7897]
          primary: "#0b6179",
          "primary-content": "#83cada",
          secondary: "#FFED66",
          accent: "#C3DEC9",
          neutral: "#F0FBFD",
          "base-100": "#ffffff",
          "base-200": "#e5e7eb",
          "base-300": "#d1d5db",
          info: "#B6E0EA",
          success: "#22B843",
          warning: "#FABA17",
          error: "#E54D4D",
        },
      },
      {
        // For Dark Mode
        dark: {
          ...require("daisyui/src/theming/themes")["[data-theme=dark]"],
          // blue: "#352cdfff",
          primary: "#4682B4",
          "primary-content": "#D1D5DB",
          secondary: "#818CF8",
          accent: "#A78BFA",
          neutral: "#375051ff",
          "base-100": "#1F2937",
          "base-200": "#111827",
          "base-300": "#1C1F24",
          // info: "#60A5FA",
          info: "#4682B4",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          gray: "#F7F3CF",
        },
      },
    ],
  },

  plugins: [require("daisyui")],
}

