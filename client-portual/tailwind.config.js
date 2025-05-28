import daisyui from "daisyui";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        red: {
          10: "#FDF3F2",
          40: "#C74E57",
          90: "#ED5E68"
        },
        yellow: {
          80: "#E7A644",
          70: "#F4BE40"
        },
        general: {
          10: "#FFFFFF",
          20: "#E1E1E1",
          40: "#6B6B6B",
          50: "#B3B3B3",
          90: "#2D2D2D",
          100: "#000000"
        },
        green: {
          10: "#EFFAF2",
          40: "#4BC17E"
        }
      }
    },
    screens: {
      mobile: { max: "499px" },
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1100x",
      "2xl": "1800px",
      "3xl": "2400px",
      "4xl": "3600px"
    }
  },
  plugins: [daisyui]
};
