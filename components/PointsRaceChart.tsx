"use client";

/**
 * PointsRaceChart — bespoke SVG line chart of cumulative constructor points,
 * Lotus vs Ferrari, across one season. No charting library: d3-scale for the
 * math, d3-shape for the path, motion for the draw-in.
 *
 * Lines draw themselves in on mount (the panel remounts this when its beat
 * becomes active), honouring prefers-reduced-motion. Built to take any
 * SeasonData so generalising across beats (build step 4) is a prop change.
 *
 * Period note: in 1970 both liveries are reds (Lotus Gold Leaf vs Ferrari
 * rosso), so each line gets a paper-coloured casing and a direct end-label to
 * stay legible where they converge late in the year.
 */

import { useMemo } from "react";
import { scaleLinear } from "d3-scale";
import { line, curveMonotoneX } from "d3-shape";
import { motion, useReducedMotion } from "motion/react";
import type { SeasonData, Livery, ChartAnnotation } from "@/data/types";

interface Pt {
  x: number;
  y: number;
}

const VIEW_W = 640;
const VIEW_H = 420;
const M = { top: 36, right: 88, bottom: 40, left: 42 };

type AnnoSide = "above" | "below";

interface AnnoMark {
  key: string;
  team: "lotus" | "ferrari";
  head: string;
  detail: string;
  cx: number;
  cy: number;
  color: string;
  side: AnnoSide;
  labelX: number;
}

/** Keep callout labels from stacking when two rounds sit close on the x-axis. */
function layoutCallouts(
  marks: Omit<AnnoMark, "side" | "labelX">[],
): AnnoMark[] {
  const MIN_X = 92;
  const laid: AnnoMark[] = [];

  for (const m of marks) {
    let side: AnnoSide = m.team === "lotus" ? "above" : "below";
    let labelX = m.cx;

    for (const prev of laid) {
      if (Math.abs(prev.labelX - labelX) >= MIN_X) continue;
      if (prev.side === side) {
        side = side === "above" ? "below" : "above";
      }
      if (Math.abs(prev.labelX - labelX) < MIN_X) {
        labelX = m.cx + (m.cx >= prev.cx ? 28 : -28);
      }
    }

    laid.push({ ...m, side, labelX });
  }

  return laid;
}

const CALLOUT = {
  stem: 34,
  headSize: 12,
  detailSize: 10,
  padX: 10,
  padY: 8,
  gap: 4,
};

const EDGE = 4; // keep callout boxes this far inside the viewBox

function calloutLayout(a: AnnoMark) {
  const w =
    Math.max(a.head.length * 7.2, a.detail.length * 6.4, 80) + CALLOUT.padX * 2;
  const h = a.detail
    ? CALLOUT.padY * 2 + CALLOUT.headSize + CALLOUT.gap + CALLOUT.detailSize
    : CALLOUT.padY * 2 + CALLOUT.headSize;

  // Box vertical position for a given side, then flip if it would clip an edge.
  const boxYFor = (above: boolean) =>
    above ? a.cy - CALLOUT.stem - h - 8 : a.cy + CALLOUT.stem + 8;
  let above = a.side === "above";
  if (above && boxYFor(true) < EDGE) above = false;
  else if (!above && boxYFor(false) + h > VIEW_H - EDGE) above = true;

  const stemEndY = above ? a.cy - CALLOUT.stem : a.cy + CALLOUT.stem;
  const boxY = boxYFor(above);
  // Keep the box (and the leader's vertical run) inside the horizontal bounds.
  const labelX = Math.min(Math.max(a.labelX, w / 2 + EDGE), VIEW_W - w / 2 - EDGE);
  const boxX = labelX - w / 2;
  const boxEdgeY = above ? boxY + h : boxY;
  const headY = boxY + CALLOUT.padY + CALLOUT.headSize * 0.85;
  const detailY = headY + CALLOUT.gap + CALLOUT.detailSize;
  const elbow = `${a.cx},${a.cy} ${a.cx},${stemEndY} ${labelX},${stemEndY} ${labelX},${boxEdgeY}`;

  return { w, h, boxX, boxY, headY, detailY, elbow, labelX };
}

export default function PointsRaceChart({
  season,
  lotusLivery,
  ferrariLivery,
  annotations,
}: {
  season: SeasonData;
  lotusLivery: Livery;
  ferrariLivery: Livery;
  annotations?: ChartAnnotation[];
}) {
  const reduce = useReducedMotion();

  const {
    lotusPath,
    ferrariPath,
    x,
    y,
    yTicks,
    rounds,
    lotusEnd,
    ferrariEnd,
    annoMarks,
    annotatedRounds,
  } = useMemo(() => {
      const rounds = season.rounds;
      const firstRound = rounds[0].round;
      const lastRound = rounds[rounds.length - 1].round;

      const lotusSeries: Pt[] = rounds.map((r) => ({ x: r.round, y: r.lotus?.points ?? 0 }));
      const ferrariSeries: Pt[] = rounds.map((r) => ({ x: r.round, y: r.ferrari?.points ?? 0 }));

      const maxPts = Math.max(
        ...lotusSeries.map((p) => p.y),
        ...ferrariSeries.map((p) => p.y),
        1
      );
      const yMax = Math.ceil(maxPts / 20) * 20;

      const x = scaleLinear().domain([firstRound, lastRound]).range([M.left, VIEW_W - M.right]);
      const y = scaleLinear().domain([0, yMax]).range([VIEW_H - M.bottom, M.top]);

      const gen = line<Pt>()
        .x((d) => x(d.x))
        .y((d) => y(d.y))
        .curve(curveMonotoneX);

      const yTicks: number[] = [];
      for (let v = 0; v <= yMax; v += 20) yTicks.push(v);

      const rawMarks = (annotations ?? [])
        .slice()
        .sort((a, b) => a.round - b.round)
        .map((a) => {
        const entry = rounds.find((r) => r.round === a.round);
        const value =
          a.team === "ferrari" ? entry?.ferrari?.points ?? 0 : entry?.lotus?.points ?? 0;
        const [head, ...rest] = a.label.split(":");
        const color = a.team === "ferrari" ? ferrariLivery.primary : lotusLivery.primary;
        return {
          key: `${a.team}-${a.round}`,
          team: a.team,
          head: head.trim(),
          detail: rest.join(":").trim(),
          cx: x(a.round),
          cy: y(value),
          color,
        };
      });

      const annoMarks = layoutCallouts(rawMarks);
      const annotatedRounds = new Set((annotations ?? []).map((a) => a.round));

      return {
        lotusPath: gen(lotusSeries) ?? "",
        ferrariPath: gen(ferrariSeries) ?? "",
        x,
        y,
        yTicks,
        rounds,
        lotusEnd: lotusSeries[lotusSeries.length - 1],
        ferrariEnd: ferrariSeries[ferrariSeries.length - 1],
        annoMarks,
        annotatedRounds,
      };
    }, [season, annotations, ferrariLivery.primary, lotusLivery.primary]);

  const drawT = reduce
    ? { duration: 0 }
    : { duration: 1.3, ease: "easeInOut" as const };
  const fadeT = (delay: number) =>
    reduce ? { duration: 0 } : { duration: 0.5, delay, ease: "easeOut" as const };

  const draw = { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: drawT };

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label={`${season.year} constructor points across the season, Lotus versus Ferrari`}
    >
      {/* y gridlines + labels */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={M.left}
            x2={VIEW_W - M.right}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--hairline)"
            strokeWidth={1}
          />
          <text
            x={M.left - 8}
            y={y(v)}
            textAnchor="end"
            dominantBaseline="middle"
            className="font-data"
            fontSize={12}
            fill="var(--ink-muted)"
          >
            {v}
          </text>
        </g>
      ))}

      {/* sparse round ticks; always label rounds with callouts */}
      {rounds
        .filter(
          (_, i) =>
            i % 3 === 0 ||
            i === rounds.length - 1 ||
            annotatedRounds.has(rounds[i].round),
        )
        .map((r) => (
          <text
            key={r.round}
            x={x(r.round)}
            y={VIEW_H - M.bottom + 18}
            textAnchor="middle"
            className="font-data"
            fontSize={11}
            fill="var(--ink-muted)"
          >
            R{r.round}
          </text>
        ))}

      {/* Ferrari line (with casing) */}
      <motion.path d={ferrariPath} fill="none" stroke="var(--paper)" strokeWidth={5} strokeLinecap="round" {...draw} />
      <motion.path d={ferrariPath} fill="none" stroke={ferrariLivery.primary} strokeWidth={2.5} strokeLinecap="round" {...draw} />

      {/* Lotus line (with casing), drawn on top */}
      <motion.path d={lotusPath} fill="none" stroke="var(--paper)" strokeWidth={5} strokeLinecap="round" {...draw} />
      <motion.path d={lotusPath} fill="none" stroke={lotusLivery.primary} strokeWidth={2.5} strokeLinecap="round" {...draw} />

      {/* Callouts sit above the lines so markers and labels stay visible. */}
      {annoMarks.map((a) => {
        const c = calloutLayout(a);
        return (
          <motion.g
            key={a.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={fadeT(reduce ? 0 : 1.05)}
          >
            <polyline
              points={c.elbow}
              fill="none"
              stroke="var(--paper)"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <polyline
              points={c.elbow}
              fill="none"
              stroke={a.color}
              strokeWidth={1.75}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx={a.cx} cy={a.cy} r={6.5} fill="var(--paper)" />
            <circle cx={a.cx} cy={a.cy} r={5} fill={a.color} stroke="var(--paper)" strokeWidth={1.5} />
            <rect
              x={c.boxX}
              y={c.boxY}
              width={c.w}
              height={c.h}
              rx={3}
              fill="var(--paper)"
              stroke={a.color}
              strokeWidth={1.25}
            />
            <text
              x={c.labelX}
              y={c.headY}
              textAnchor="middle"
              className="font-data"
              fontSize={CALLOUT.headSize}
              fontWeight={700}
              fill={a.color}
            >
              {a.head}
            </text>
            {a.detail && (
              <text
                x={c.labelX}
                y={c.detailY}
                textAnchor="middle"
                className="font-data"
                fontSize={CALLOUT.detailSize}
                fill="var(--ink)"
              >
                {a.detail}
              </text>
            )}
          </motion.g>
        );
      })}

      {/* end-of-line labels */}
      <motion.text
        x={x(lotusEnd.x) + 8}
        y={y(lotusEnd.y)}
        dominantBaseline="middle"
        className="font-data"
        fontSize={12}
        fontWeight={700}
        fill={lotusLivery.primary}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={fadeT(reduce ? 0 : 1.2)}
      >
        Lotus {lotusEnd.y}
      </motion.text>
      <motion.text
        x={x(ferrariEnd.x) + 8}
        y={y(ferrariEnd.y)}
        dominantBaseline="middle"
        className="font-data"
        fontSize={12}
        fontWeight={700}
        fill={ferrariLivery.primary}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={fadeT(reduce ? 0 : 1.2)}
      >
        Ferrari {ferrariEnd.y}
      </motion.text>
    </svg>
  );
}
