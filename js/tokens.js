// Vectrum colour tokens. Every colour used by the backgrounds comes from here.
// Sources:
//   figma: file CVEmdBe0mvGk4bW9XEGSoG, Color Variables (get_variable_defs)
//   dev:   https://dev.vectrumspace.eu  /api/public/dev/styles.css
//   www:   https://www.vectrumspace.eu  /_next/static/chunks/*.css (LandingPage module)
// Rule: no colour outside this file. Red from the logo / NOTIFY-RED / STATUS-Red is NOT used.
// Alpha is applied at draw time with rgba(token, a); the hue/value stay exactly the token's.
window.TOKENS = {
  // accent
  accentMain:      "#4D76F7", // figma: Color/Accent-main = dev: --accent = www: --accent
  accentHover:     "#3F66E0", // dev: --accent-hover
  statusBlueText:  "#60A5FA", // figma: STATUS/Blue-text = www: --tracking-filter-color
  wwwBlue:         "#5368FF", // www: --blue
  markerTone:      "#6F7FFF", // www: --marker-tone

  // surfaces / backgrounds
  blueGlass:       "#121625", // figma: Color/Blue-Glass (#121625cc, used opaque)
  blueGlassLight:  "#171C30", // figma: Color/Blue-Glass-Light
  spreadsheet:     "#222B48", // figma: Color/Spreadsheet = www: .ecosystemBand base
  lineBlue:        "#2B3559", // figma: Color/Line-Blue = www: --figma-line
  networkBg:       "#0D1120", // www: .network card background
  panelDeep:       "#0B1020", // www: --panel-deep
  wwwBg:           "#070A12", // www: --bg
  devBg:           "#0D1019", // dev: --bg

  // gradients
  wwwPageA:        "#12172A", // www: .page linear-gradient(116deg, #12172a 9.56%, ...)
  wwwPageB:        "#0D0D13", // www: .page linear-gradient(..., #0d0d13 86.04%)
  devPageA:        "#121828", // dev: .page linear-gradient(172deg, #121828 0%, ...)
  devPageB:        "#10131D", // dev: .page ... #10131d 45%
  devPageC:        "#0D0E14", // dev: .page ... #0d0e14 100%

  // glows (dev hero blobs, blue part only)
  glowCenterA:     "#3A56B2", // dev: .b-center rgba(58,86,178,.85)
  glowCenterB:     "#2A3A8A", // dev: .b-center rgba(42,58,138,.45)
  glowTR:          "#3C48AA", // dev: .b-tr rgba(60,72,170,.7)
  wwwLine:         "#647CC8", // www: --line #647cc838

  // text (only for previews, never in backgrounds)
  textPrimary:     "#F7F8FC", // dev: .hero h1 color
  textSub:         "#B4BCCF", // dev: .hero p color
  textSecondary:   "#DADADA", // figma: Color-Text/secondary-text
};
