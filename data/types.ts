/**
 * types.ts
 * Shapes for the build-time data (data/seasons/*.json) and the
 * narrative config that drives the scrollytelling sections.
 */

/* ---------- Fetched data (output of scripts/fetch-data.mjs) ---------- */

export interface TeamStanding {
  points: number;
  position: number;
  wins: number;
}

export interface RoundEntry {
  round: number;
  raceName: string;
  circuit: string | null;
  country: string | null;
  date: string; // ISO date
  lotus: TeamStanding | null; // null if no Lotus entry classified yet
  ferrari: TeamStanding | null;
}

export interface SeasonData {
  year: number;
  rounds: RoundEntry[];
  final: {
    lotus: TeamStanding | null;
    ferrari: TeamStanding | null;
    champion: { id: string; name: string } | null;
  };
}

/* ---------- Narrative config (hand-written, the essay's beats) ---------- */

/**
 * Liveries double as chart colors. The JPS switch in 1972 is itself a
 * narrative beat (commercialisation), so livery is per-section, not global.
 */
export interface Livery {
  primary: string; // chart line + accents
  secondary: string;
  label: string; // e.g. "British racing green / yellow", "JPS black / gold"
}

export type VisualKind =
  | "points-race" // animated line chart from SeasonData.rounds
  | "tech-diagram" // inset SVG: monocoque, type 72 wedge, type 79 venturi
  | "livery-moment" // full-bleed livery treatment for era transitions
  | "epilogue"; // closing comparative state

export interface Section {
  id: string;
  years: number[]; // one or two seasons (1972+1973 share a section)
  title: string;
  kicker: string; // short overline, e.g. "1970 · Zandvoort to Monza"
  visual: VisualKind;
  lotusLivery: Livery;
  /** Rounds to annotate on the chart: round number → short label */
  annotations?: Record<number, string>;
}

/* ---------- The eight beats ---------- */

export const SECTIONS: Section[] = [
  {
    id: "arrival",
    years: [1958],
    title: "An institution meets an idea",
    kicker: "1958 · Lotus arrives",
    visual: "points-race",
    lotusLivery: {
      primary: "#1B4D3E",
      secondary: "#F2C500",
      label: "British racing green / yellow",
    },
  },
  {
    id: "clark-peak",
    years: [1963, 1965],
    title: "Clark, Chapman, and the monocoque",
    kicker: "1963–1965 · The Type 25",
    visual: "tech-diagram",
    lotusLivery: {
      primary: "#1B4D3E",
      secondary: "#F2C500",
      label: "British racing green / yellow",
    },
  },
  {
    id: "dfv",
    years: [1967],
    title: "The DFV changes the economics",
    kicker: "1967 · Cosworth arrives at Zandvoort",
    visual: "points-race",
    lotusLivery: {
      primary: "#1B4D3E",
      secondary: "#F2C500",
      label: "British racing green / yellow",
    },
    annotations: { 3: "DFV wins on debut, Dutch GP" },
  },
  {
    id: "seventy",
    years: [1970],
    title: "The 72, the 312B, and the cost",
    kicker: "1970 · Rindt",
    visual: "points-race",
    lotusLivery: {
      primary: "#B30000",
      secondary: "#FFFFFF",
      label: "Gold Leaf red / white / gold",
    },
    annotations: { 8: "Monza: Rindt killed in practice" },
  },
  {
    id: "jps",
    years: [1972, 1973],
    title: "Black and gold, red at its nadir",
    kicker: "1972–1973 · Fittipaldi era",
    visual: "livery-moment",
    lotusLivery: {
      primary: "#0A0A0A",
      secondary: "#C9A227",
      label: "JPS black / gold",
    },
  },
  {
    id: "ground-effect",
    years: [1978],
    title: "The 79: Chapman's last masterpiece",
    kicker: "1978 · Ground effect",
    visual: "tech-diagram",
    lotusLivery: {
      primary: "#0A0A0A",
      secondary: "#C9A227",
      label: "JPS black / gold",
    },
  },
  {
    id: "epilogue",
    years: [],
    title: "What each marque became",
    kicker: "After Chapman",
    visual: "epilogue",
    lotusLivery: {
      primary: "#0A0A0A",
      secondary: "#C9A227",
      label: "JPS black / gold",
    },
  },
];

export const FERRARI_LIVERY: Livery = {
  primary: "#C00000",
  secondary: "#FFD200",
  label: "Rosso corsa",
};
