# Lotus vs Ferrari — an interactive timeline

A scrollytelling companion to a long-form essay on the Lotus and Ferrari
rivalry (1958 to 1978), read as a lens on Ferrari's modern institutional
character. One persistent visual panel sits pinned while the narrative beats
scroll past it; a bespoke points-race chart morphs between season states, drawn
in period-correct liveries.

Standalone microsite. Next.js App Router, fully static, deployed on Vercel.

## How it works

- **No runtime API calls.** `scripts/fetch-data.mjs` hits the Jolpica-F1
  (Ergast-compatible) API once for the narrative seasons, merges Lotus's
  era-specific composite constructor IDs (`lotus-climax`, `lotus-ford`,
  `lotus-brm`, ...) into a single marque, and writes JSON under
  `data/seasons/`. That output is committed, so builds never touch the network.
- **Scroll orchestration is Framer Motion** (`motion`): `useScroll` drives a
  sticky visual panel; the active beat is derived from scroll position, no raw
  scroll listeners.
- **The chart is hand-built SVG**, not a charting library. `d3-scale` does the
  math and `d3-shape` builds the path; `motion` draws the lines in. See
  `components/PointsRaceChart.tsx`.
- **The essay's argument drives the structure.** `data/types.ts` defines the
  narrative beats (`SECTIONS`): years, livery, visual kind, and chart
  annotations. The prose lives in `data/content.ts`.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static production build
npm run fetch-data   # re-fetch season data (rarely needed; output is committed)
```

Node 18+ (the fetch script uses global `fetch`). Raw API responses cache under
`.cache/` (gitignored); the merged `data/` output is committed.

## Structure

- `app/` — layout, fonts, the page (hero + scrollytelling + footer).
- `components/Scrollytelling.tsx` — sticky panel + narrative beats.
- `components/PointsRaceChart.tsx` — bespoke SVG points-race chart.
- `data/types.ts` — data shapes and the `SECTIONS` narrative config.
- `data/content.ts` — section prose.
- `data/seasons/*.json`, `data/summary.json` — committed fetch output.
- `scripts/fetch-data.mjs` — the one-shot data pipeline.

## Design tokens

Vintage motorsport aesthetic, tokens defined in `app/globals.css` (OKLCH):

- Surfaces: `--paper`, `--paper-2`; text: `--ink`, `--ink-muted`; rules:
  `--hairline`; editorial accent: `--accent`. Exposed to Tailwind as
  `bg-paper`, `text-ink`, `border-hairline`, etc.
- Type: Fraunces (display), Inter (body), Space Mono (data labels), wired via
  `next/font` and mapped to `--font-display` / `--font-sans` / `--font-mono`.

The placeholder palette is seeded; the real tokens come from adamoentoro.com.
House rule: no em-dashes in user-facing copy.

## Data caveat

For the 1960s, Jolpica treats Lotus's engine partners as separate constructors.
The pipeline sums their points into one Lotus marque line, so a season total may
differ from a Wikipedia "constructors' championship" column that credits only
the title-winning composite (for example, 1963 reads 58 here = Climax 54 + BRM
4, versus the official Lotus-Climax 54). This is the deliberate marque-vs-marque
framing the essay calls for.
