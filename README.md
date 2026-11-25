# MUYAN company website

Static, bilingual company website at https://myzy.ai, hosted by GitHub Pages from `main` at the repository root. No build or package installation is required.

## Local preview

Run `python3 -m http.server 4173` from this directory, then visit http://localhost:4173.

## Editing

- `index.html`: semantic content; Chinese default, English in `data-en` attributes.
- `assets/site.css`: responsive layout and VI design tokens.
- `assets/site.js`: language selection, mobile navigation and the explicitly started official film. The page remains readable without JavaScript, with a direct film link as fallback.
- `assets/motion.js` + `assets/effects.css`: independent scroll reveals, light-field response, slow orbital decoration, bounded button movement (4px), product depth (24px), and reading progress. Static mode is persistent and system reduced-motion is respected. Touch screens do not use pointer effects. Hero animation pauses offscreen or when the tab is hidden. No runtime dependencies or continuous JavaScript rendering loop.
- `assets/starry/`: official promotional film, compressed to 720p without changing its content, plus a poster extracted at 02:04. Video bytes load only after Play is selected; playback pauses offscreen or when the tab is hidden.
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
- Official Xiaohongshu account (linked by the official game website): https://xhslink.com/m/1aBCGXfSf5V
- Official Xiaohongshu public-launch PV, read from the account 星眠手游: https://xhslink.cn/o/9cZEMqJNjai
- Source for the embedded film: https://cos.starry.games/web/videos/video_home_page.13220811aeda4c69.mp4
- Recruiting email retained from the previous public company website: joinus@myzy.ai

The public-launch text and registration CTAs should be reviewed when the game launches. Product copy describes verified AI conversations, a personal diary, hotel management, and stories across different worlds. AI is described in the context of interaction, consistent with the official Xiaohongshu profile. No user counts, revenue, internal testing data or player testimonials are published.
