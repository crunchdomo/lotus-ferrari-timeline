# Lotus vs Ferrari — interactive timeline

Scrollytelling companion to a long-form essay on the Lotus vs Ferrari rivalry
as a lens on Ferrari's modern institutional character. Standalone microsite,
deployed on Vercel, public repo on GitHub (portfolio piece).

## Architecture decisions (settled, do not relitigate)

- **Next.js App Router, TypeScript, Tailwind. Fully static output** (`output: "export"` is acceptable; nothing here needs a server).
- **No runtime API calls.** `scripts/fetch-data.mjs` hits Jolpica-F1 once,
  output is committed under `data/seasons/`. The app imports JSON.
- **Framer Motion** for scroll orchestration: `useScroll` + a sticky visual
  panel. Narrative sections scroll past beside it (desktop) or above it
  (mobile). No raw scroll listeners.
- **One persistent chart that morphs between season states**, not a chart per
  section. Points-race line chart, Lotus vs Ferrari, domain re-animates per
  section. Lines are drawn in period-correct liveries (see `data/types.ts`,
  the JPS switch in 1972 is a deliberate narrative beat).
- **Tech diagrams are hand-built inset SVGs**: Type 25 monocoque
  cross-section, Type 72 wedge profile, Type 79 venturi tunnels.
- Design tokens come from adamoentoro.com: OKLCH color tokens, Fraunces for
  display, Inter for body, Space Mono for data labels. Vintage motorsport
  aesthetic. Import the token file before building any component.

## Structure

- `scripts/fetch-data.mjs` — data pipeline, run once with `node`, Node 18+,
  no dependencies. Caches responses in `.cache/` (gitignored).
- `data/types.ts` — types for fetched data, plus `SECTIONS`: the eight
  narrative beats with years, livery, visual kind, and chart annotations.
  The essay's argument drives the structure; the data serves it.
- `data/seasons/*.json`, `data/summary.json` — committed fetch output.

## Build order

1. Run the fetch script, sanity-check the JSON (Lotus appears under
   composite IDs like `lotus-climax` / `lotus-ford` in the 60s; the script
   already merges them, verify totals look right against the final
   standings).
2. Scroll skeleton with all eight sections as placeholder text + a sticky
   panel showing the section id. Get the pinning right on mobile first.
3. The points-race chart for one season (1970 — richest beat: Rindt's
   posthumous title, annotation support needed).
4. Generalise the chart across sections, add morph transitions.
5. Tech diagram SVGs, livery-moment treatment, epilogue.
6. `@vercel/og` share image, metadata, then polish.

## Constraints

- Deploy target is Vercel, connect the repo early so every push previews.
- Keep dependencies minimal: framer-motion, d3-scale/d3-shape at most for
  the chart. No charting library; the chart is bespoke SVG.
- Prose content (the essay sections) lives in MDX or a typed content file,
  author's voice, no placeholder lorem beyond step 2.
- No em-dashes anywhere in user-facing copy.
