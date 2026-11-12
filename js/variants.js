// One config per template. All motion is a function of loop phase p = frame / frames.
// Colours are token NAMES from tokens.js, never hex.
// Values are the same as vectrum-bg/config/variants.js, so 1:1 output matches the approved renders.
window.COMMON = {
  fps: 30,
  seconds: 10,            // loop length T
  grain: 3.2,             // film grain amplitude, in 8-bit levels (std-ish)
  // Safe zone: top ~55% and left side stay calm. Elements' alpha is multiplied by
  // mask(x,y) = floor + (1-floor) * smoothstep(y0,y1,y) blended with x.
  safe: { y0: 0.42, y1: 0.78, xBoost: 0.35, floor: 0.12 },
};

// Text zones are chosen so the text survives both the Reels UI and the centre crop of the profile grid.
// logo: mark height h at (x, y); with the text on top, the text starts at least `gap` below it.
window.FORMATS = {
  "9x16": { label: "9:16 · Reels", w: 1080, h: 1920, text: { x: 80, maxW: 850, top: 300, bottom: 1580, maxH: 900, h1: 96, h2: 40 }, logo: { x: 80, y: 270, h: 72, gap: 56 } },
  "1x1":  { label: "1:1 · Пост",   w: 1080, h: 1080, text: { x: 80, maxW: 920, top: 110, bottom: 990,  maxH: 680, h1: 80, h2: 34 }, logo: { x: 80, y: 72,  h: 58, gap: 44 } },
};

// Brand signature next to the mark: "Vectrum" + the accent word.
window.LOGOS = {
  dev:   { label: "Vectrum Dev",   word: "Dev" },
  space: { label: "Vectrum Space", word: "Space" },
  none:  { label: "Без логотипа" },
};

// Page colours per theme; a variant's `light` block overrides its own fields for the light theme.
window.THEMES = {
  dark:  { label: "Тёмная",  page: ["wwwPageA", "wwwPageB"],     glowComp: "screen",      overlay: "wwwPageB",   h1: "textPrimary", h2: "textSub",     logoText: "textPrimary" },
  light: { label: "Светлая", page: ["lightPageA", "lightPageB"], glowComp: "source-over", overlay: "lightPageA", h1: "textDark",    h2: "textDarkSub", logoText: "textDark" },
};

window.VARIANTS = {
  "02-network": {
    title: "Network",
    bg: { type: "www", glow: [{ color: "glowCenterB", x: 0.78, y: 0.82, r: 600, a: 0.22, breathe: 0.2 }] },
    network: {
      nodes: 96, drift: 30, linkDist: 195,
      line: "wwwLine", lineAlpha: 0.48,
      node: "lineBlue", nodeAlpha: 0.9,
      hubs: 6, hubFill: "spreadsheet", hubStroke: "accentMain", hubAlpha: 0.7,
      pulses: 3, pulseEdges: 5, pulseColor: "accentMain", pulseAlpha: 0.55, pulseSeconds: 5,
      bias: 1.6,           // density bias towards bottom-right
    },
    light: {
      bg: { glow: [{ color: "lightGlowB", x: 0.78, y: 0.82, r: 600, a: 0.55, breathe: 0.2 }] },
      network: { line: "accentMain", lineAlpha: 0.62, hubFill: "lightPageA", hubStroke: "accentMain", hubAlpha: 0.95, pulseAlpha: 0.85 },
    },
  },

  "04-aurora": {
    title: "Aurora",
    bg: { type: "www", glow: [] },
    aurora: {
      blobs: [
        { color: "glowCenterA", cx: 0.80, cy: 0.86, orbit: 90,  r: 640, a: 0.42, turns: 1,  phase: 0.00 },
        { color: "glowTR",      cx: 0.98, cy: 0.62, orbit: 70,  r: 520, a: 0.30, turns: -1, phase: 0.35 },
        { color: "accentMain",  cx: 0.55, cy: 1.02, orbit: 80,  r: 560, a: 0.16, turns: 1,  phase: 0.70 },
      ],
      wobble: 0.10,        // radius modulation from loop noise
    },
    light: {
      aurora: {
        blobs: [
          { color: "lightGlowA", cx: 0.80, cy: 0.86, orbit: 90,  r: 640, a: 0.85, turns: 1,  phase: 0.00 },
          { color: "lightGlowB", cx: 0.98, cy: 0.62, orbit: 70,  r: 520, a: 0.90, turns: -1, phase: 0.35 },
          { color: "accentMain", cx: 0.55, cy: 1.02, orbit: 80,  r: 560, a: 0.40, turns: 1,  phase: 0.70 },
        ],
      },
    },
  },
};
