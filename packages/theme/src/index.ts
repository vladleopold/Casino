export const brandPalette = {
  ink: "#06070A",
  night: "#0C1017",
  gold: "#FFD15A",
  goldDeep: "#A87A1A",
  emerald: "#2ED39A",
  mist: "#AAB6C4",
  white: "#F8FAFC"
} as const;

export const gradients = {
  hero:
    "radial-gradient(circle at top left, rgba(255, 209, 90, 0.24), transparent 38%), radial-gradient(circle at top right, rgba(46, 211, 154, 0.18), transparent 35%), linear-gradient(180deg, #111827 0%, #06070A 100%)",
  panel:
    "linear-gradient(180deg, rgba(16, 22, 31, 0.95) 0%, rgba(8, 10, 15, 0.98) 100%)"
} as const;

export const motionTokens = {
  fast: 0.18,
  base: 0.32,
  slow: 0.56
} as const;
