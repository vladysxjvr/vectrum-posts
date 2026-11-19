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

  // Route: the map appears, city A, city B, then a thin line joins them; everything fades out before the seam.
  "09-route": {
    title: "Route",
    bg: { type: "www", glow: [{ color: "glowCenterB", x: 0.6, y: 0.75, r: 640, a: 0.18, breathe: 0.2 }] },
    route: {
      // dots come from vectrum-bg (Natural Earth, Mercator, Kraków at `at` in a 1080×1080 square);
      // place = scale and offset of that square per format
      center: [19.94, 50.06], at: [690, 700], pxPerDeg: 19.6,
      place: { "9x16": { s: 1.25, x: -180, y: 600 }, "1x1": { s: 1, x: 0, y: 100 } },
      dot: { r: 1.5, color: "wwwLine", alpha: 0.42, coastAlpha: 0.7 },
      cities: [
        { name: "Kraków", ll: [19.94, 50.06], at: 0.17, label: "right" },
        { name: "Paris",  ll: [2.35, 48.86],  at: 0.29, label: "left" },
      ],
      // timeline in loop fractions (10 s loop: 0.1 = 1 s)
      mapIn: [0.0, 0.14],  // dots ripple out from the first city
      line: [0.38, 0.60],  // the line draws from A to B
      travel: [0.62, 0.82], // a light runs along the finished line once
      out: [0.86, 0.98],   // everything fades away, frame 300 = frame 0 = empty background
      point: "accentMain", pointR: 7, ring: "accentMain", ringMax: 46,
      lineColor: "accentMain", lineAlpha: 0.9, lineW: 1.6, bend: 0.18,
      label: "textSub", labelSize: 28,
    },
    light: {
      bg: { glow: [{ color: "lightGlowB", x: 0.6, y: 0.75, r: 640, a: 0.5, breathe: 0.2 }] },
      route: { dot: { r: 1.5, color: "accentMain", alpha: 0.28, coastAlpha: 0.45 }, label: "textDarkSub" },
    },
  },

  "08-stars": {
    title: "Stars",
    bg: { type: "www", glow: [{ color: "glowCenterB", x: 0.80, y: 0.86, r: 640, a: 0.22, breathe: 0.25 }] },
    // twinkling sky: every star fades in and out a whole number of times per loop
    starfield: {
      count: 230,          // per 1080×1080, scaled by frame area
      big: 0.1,            // share of larger stars with a halo and a cross flare
      colors: [["statusBlueText", 0.45], ["markerTone", 0.3], ["accentMain", 0.25]],
      alpha: 0.6,
      flare: 3,            // cross flare arm length, in star radii
      flareAlpha: 0.45,
      calm: 0.55,          // alpha at the calmest point of the safe-zone mask
    },
    // falling stars, after 01-fallen-stars: core + blurred tail, wrap across the loop seam
    meteors: {
      count: 4, flight: 1.8, travel: 640, angleDeg: 26, scale: 2.2, tailMax: 220, opacity: 0.7,
      area: { x0: 0.06, x1: 0.62, y0: 0.05, y1: 0.55 },
      core: "statusBlueText", tail: "accentMain", glow: "accentMain",
    },
    light: {
      bg: { glow: [{ color: "lightGlowB", x: 0.80, y: 0.86, r: 640, a: 0.6, breathe: 0.25 }] },
      starfield: { colors: [["accentMain", 0.6], ["wwwBlue", 0.25], ["statusBlueText", 0.15]], alpha: 0.6 },
      meteors: { core: "accentMain", tail: "accentMain", glow: "lightGlowA", opacity: 0.75 },
    },
  },
};
