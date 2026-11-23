# vectrum-dev-demo

Copy of the live https://dev.vectrumspace.eu with a CTA and funnel prototype on top. It is a sample for the developer, not a site to promote:
every page is `noindex`, `robots.txt` blocks everything, Google Ads is not loaded, and **the form sends nothing** (`POST /api/public/dev/leads` answers 200 and stores nothing).

Start: `node vectrum-dev-demo/server.js` (port `PORT`, default 10000). Refresh the copy: `node vectrum-dev-demo/tools/mirror.js`.

## What changed compared to the live site

All of it is in `demo/` plus `PATCHES` in `server.js`; the files in `site/` are the untouched copy.

| # | Change | Where |
|---|---|---|
| 1 | Cookie panel is a compact bar at the bottom, the hero button stays visible (also on phones) | `v2.css`, top |
| 2 | One CTA text everywhere: "Get a free estimate" (keys `cta`, `order`), the same on service and project pages | `v2.js`, texts |
| 3 | Hero: specific offer (who, what, how fast), promise under the button, second link "See our work" | `v2.js` home |
| 4 | Services: each card has its own description with "from €[…]" and timing; "Progress reporting" became the mobile app card | `v2.js` home |
| 5 | Why us 004–006 no longer repeat the services: ownership, support after launch, one contact person | `v2.js` home |
| 6 | Portfolio: finished client work first (Aquila, Joy Lab), "In development" last | `v2.js` home |
| 7 | New "Results for our clients" block: real numbers from the projects + 2 review placeholders (dashed, orange) | `v2.js` home |
| 8 | New "How we work" block: 4 steps, what happens after the click | `v2.js` home |
| 9 | Form: phone optional, clear title and promise, consent text with a privacy policy link, WhatsApp / Telegram / email under the button | `v2.js`, `server.js` PATCHES |
| 10 | Service and project pages: a short form (name, email, what you need) instead of a link back to the home page | `v2.js`, end |
| 11 | Sticky CTA bar on phones after the hero, hidden while a form is on screen | `v2.js`, `v2.css` |
| 12 | Funnel events in `dataLayer`: `cta_click` (with place), `form_start`, `form_sent`; ready for GA4 / Clarity | `v2.js` |
| 13 | `crypto.randomUUID()` fallback: on iOS Safari < 15.4 the form did not work at all | `server.js` PATCHES |

## To fill in before going live

- Prices: every `€[…]` / `[…] €` in `demo/v2.js`.
- Timings to confirm: "4–8 weeks" in the hero, per-service weeks, "estimate in 2 working days", "reply within 24 hours".
- Real client reviews instead of the placeholders (`revPh`, `revWho`). Do not invent them.
- Privacy policy: `demo/privacy.html` is a draft; company name, address, NIP and retention period are missing.
- Analytics: add GA4 or Microsoft Clarity; the events above are already sent.
- Texts are written in en / pl / ru / uk; a native speaker should read pl and uk.
