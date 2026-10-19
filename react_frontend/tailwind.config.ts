import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // MANDATORY: Class strategy for instant toggle
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Add paths to shadcn/ui or Aceternity components if used
  ],
  theme: {
    extend: {
      // --- COLORS: OKLCH via CSS Variables (Defined in globals.css) ---
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
          950: "hsl(var(--primary-950))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Semantic aliases for charts/status
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
      },

      // --- GRADIENTS (Utility Classes) ---
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-hero": "var(--gradient-hero)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-surface": "var(--gradient-surface)",
        "gradient-glow": "var(--gradient-glow)",
        "gradient-mesh": "var(--gradient-mesh)", // For Hero Canvas/CSS fallback
      },

      // --- BOX SHADOWS (Glow System) ---
      boxShadow: {
        glow: "var(--shadow-glow)",
        "glow-lg": "var(--shadow-glow-lg)",
        "glow-xl": "var(--shadow-glow-xl)",
        "glow-inner": "var(--shadow-glow-inner)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        glass: "var(--shadow-glass)",
      },

      // --- BORDER RADIUS ---
      borderRadius: {
        lg: "var(--radius)", // 12px
        md: "calc(var(--radius) - 4px)", // 8px
        sm: "calc(var(--radius) - 8px)", // 4px
        xl: "calc(var(--radius) + 4px)", // 16px
        "2xl": "calc(var(--radius) + 12px)", // 24px
        full: "9999px",
      },

      // --- FONTS ---
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        xs: ["0.85rem", { lineHeight: "1.25rem" }],
        sm: ["0.95rem", { lineHeight: "1.4rem" }],
        base: ["1.0625rem", { lineHeight: "1.65rem" }],
        lg: ["1.2rem", { lineHeight: "1.75rem" }],
        xl: ["1.375rem", { lineHeight: "1.9rem" }],
        "2xl": ["1.65rem", { lineHeight: "2.15rem" }],
        "3xl": ["2.1rem", { lineHeight: "2.5rem" }],
        "4xl": ["2.65rem", { lineHeight: "3rem" }],
        "5xl": ["3.5rem", { lineHeight: "1" }],
      },

      // --- ANIMATION KEYFRAMES (Referenced in globals.css) ---
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-down": { from: { opacity: "0", transform: "translateY(-10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        "shimmer": { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "pulse-glow": { "0%, 100%": { boxShadow: "var(--shadow-glow)" }, "50%": { boxShadow: "var(--shadow-glow-xl)" } },
        "float": { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        "rotate-slow": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        "border-beam": { "0%": { offsetDistance: "0%" }, "100%": { offsetDistance: "100%" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.2s ease-in",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-down": "slide-down 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "shimmer": "shimmer 2s infinite linear",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "border-beam": "border-beam 3s ease-in-out infinite",
        // Page Transitions
        "page-enter": "fade-in 0.4s ease-out, slide-up 0.4s ease-out",
        "page-exit": "fade-out 0.2s ease-in, slide-down 0.2s ease-in",
      },

      // --- TRANSITION TIMING ---
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.16, 1, 0.3, 1)", // Framer Motion default spring approx
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "expo-in": "cubic-bezier(0.7, 0, 0.84, 0)",
      },

      // --- Z-INDEX SCALE ---
      zIndex: {
        hide: "-1",
        base: "0",
        dropdown: "100",
        sticky: "200",
        overlay: "300",
        modal: "400",
        popover: "500",
        tooltip: "600",
        toast: "700",
        max: "9999",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // Required for shadcn/ui accordion etc.
    // Add plugin for @tailwindcss/typography (prose classes for Markdown)
    require("@tailwindcss/typography"),
  ],
};
export default config;
