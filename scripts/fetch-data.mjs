/**
 * fetch-data.mjs
 * Build-time data pipeline for the Lotus vs Ferrari timeline.
 *
 * Pulls per-round constructor standings from Jolpica-F1 (Ergast-compatible)
 * for the narrative seasons, extracts the Lotus and Ferrari points race,
 * and writes one JSON file per season plus a summary index.
 *
 * Run once, commit the output. No runtime API calls in the app.
 *
 * Usage: node scripts/fetch-data.mjs
 * Requires Node 18+ (global fetch).
 */

import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";

const API_BASE = "https://api.jolpi.ca/ergast/f1";
const OUT_DIR = path.resolve("data/seasons");
const CACHE_DIR = path.resolve(".cache/jolpica");

// Narrative beats. 1972+1973 are one essay section but fetched separately.
const SEASONS = [1958, 1963, 1965, 1967, 1970, 1972, 1973, 1978];

// Jolpica/Ergast constructor IDs vary across eras for Lotus:
// chassis-engine composites in the 60s ("lotus-climax", "lotus-ford",
// "lotus-brm"), "team_lotus" elsewhere. Plain "lotus" is the unrelated
// 2012-2015 team, but it never appears in these seasons, so a substring
// match is safe here. Ferrari is "ferrari" throughout.
const isLotus = (c) =>
  c.Constructor?.constructorId?.includes("lotus") ||
  c.Constructor?.name?.includes("Lotus");
const isFerrari = (c) => c.Constructor?.constructorId === "ferrari";

// Jolpica unauthenticated limits: ~4 req/s burst, 500/hr sustained.
// ~8 seasons x ~11-17 rounds plus race lists stays well under the hourly
// cap, but be polite and retry on 429.
const DELAY_MS = 400;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cachedFetch(url) {
  const key = url.replace(/[^a-z0-9]/gi, "_") + ".json";
  const cachePath = path.join(CACHE_DIR, key);

  try {
    await access(cachePath);
    return JSON.parse(await readFile(cachePath, "utf8"));
  } catch {
    /* cache miss, fall through */
  }

  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      const wait = attempt * 2000;
      console.warn(`  429 on ${url}, backing off ${wait}ms`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    const json = await res.json();
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cachePath, JSON.stringify(json));
    await sleep(DELAY_MS);
    return json;
  }
  throw new Error(`Gave up after retries: ${url}`);
}

/** Race calendar for a season: round numbers, names, dates, circuits. */
async function fetchRaces(year) {
  const json = await cachedFetch(`${API_BASE}/${year}.json?limit=100`);
  return json.MRData.RaceTable.Races.map((r) => ({
    round: Number(r.round),
    raceName: r.raceName,
    circuit: r.Circuit?.circuitName ?? null,
    country: r.Circuit?.Location?.country ?? null,
    date: r.date,
  }));
}

/** Constructor standings as of a given round. */
async function fetchStandingsAtRound(year, round) {
  const json = await cachedFetch(
    `${API_BASE}/${year}/${round}/constructorstandings.json?limit=100`
  );
  const lists = json.MRData.StandingsTable.StandingsLists;
  if (!lists?.length) return null; // round not yet in dataset / no standings
  return lists[0].ConstructorStandings;
}

function extractTeam(standings, predicate) {
  if (!standings) return null;
  // A marque can appear under multiple composite IDs in one season
  // (e.g. lotus-climax and lotus-brm in 1967). Take the best-placed entry
  // for position, sum points across entries for the points race.
  const entries = standings.filter(predicate);
  if (!entries.length) return null;
  const points = entries.reduce((sum, e) => sum + Number(e.points), 0);
  const wins = entries.reduce((sum, e) => sum + Number(e.wins), 0);
  // Unclassified composite entries carry positionText "-" (position undefined),
  // which would poison Math.min with NaN. Only rank by classified entries.
  const positions = entries
    .map((e) => Number(e.position))
    .filter((p) => Number.isFinite(p));
  const position = positions.length ? Math.min(...positions) : null;
  return { points, position, wins };
}

async function buildSeason(year) {
  console.log(`Season ${year}`);
  const races = await fetchRaces(year);
  const rounds = [];

  for (const race of races) {
    const standings = await fetchStandingsAtRound(year, race.round);
    rounds.push({
      ...race,
      lotus: extractTeam(standings, isLotus),
      ferrari: extractTeam(standings, isFerrari),
    });
    console.log(`  R${race.round} ${race.raceName}`);
  }

  const final = rounds.at(-1);
  const championStandings = await fetchStandingsAtRound(year, final.round);
  const champion = championStandings?.find((c) => c.position === "1");

  return {
    year,
    rounds,
    final: {
      lotus: final.lotus,
      ferrari: final.ferrari,
      champion: champion
        ? { id: champion.Constructor.constructorId, name: champion.Constructor.name }
        : null,
    },
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const summary = [];

  for (const year of SEASONS) {
    const season = await buildSeason(year);
    const file = path.join(OUT_DIR, `${year}.json`);
    await writeFile(file, JSON.stringify(season, null, 2));
    summary.push({ year, file: `data/seasons/${year}.json`, final: season.final });
    console.log(`  → wrote ${file}\n`);
  }

  await writeFile(
    path.resolve("data/summary.json"),
    JSON.stringify(summary, null, 2)
  );
  console.log("Done. Commit data/ so builds never touch the API.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
