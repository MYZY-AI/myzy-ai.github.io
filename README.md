# MUYAN company website

Static, bilingual company website at https://myzy.ai, hosted by GitHub Pages from `main` at the repository root. No build or package installation is required.

## Local preview

Run `python3 -m http.server 4173` from this directory, then visit http://localhost:4173.

## Editing

- `index.html`: semantic content; Chinese default, English in `data-en` attributes.
- `assets/site.css`: responsive layout and VI design tokens.
- `assets/site.js`: language selection and mobile navigation; the page remains readable without JavaScript.
- `assets/motion.js`: progressive scroll reveals, fine-pointer light-field response, and reading progress. Static mode is persistent and system reduced-motion is respected. No runtime dependencies or continuous rendering loop.
- `assets/brand/`: original exported Figma brand assets. Do not redraw, distort or recolor the logo.
- `assets/fonts/`: locally hosted open-source brand fonts and licenses. Chinese uses a system fallback unless HYQiHei is installed.
- `og-card.png`: social preview image; its 1200 × 630 source is `design/og-card.html`.
- `favicon.svg`: the official VI symbol.

## Content sources (verified 2026-11-25)

- VI: https://www.figma.com/design/r1UkLPSeB1xchW7JzjLWlq/Muyan-Branding--Copy-?node-id=6049-159
- The company now retains only Starry (星眠), confirmed by the owner.
- Official game website: https://starry.games/
- Public launch announcement (January 20, 2027): https://www.taptap.cn/moment/868948894984176961
- Official TapTap entry: https://www.taptap.cn/app/839063
- Recruiting email retained from the previous public company website: joinus@myzy.ai

The public-launch text and registration CTAs should be reviewed when the game launches. No user counts, revenue, or internal testing data are published.
