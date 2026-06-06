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
import type { SeasonData, Livery } from "@/data/types";

interface Pt {
  x: number;
  y: number;
}

const VIEW_W = 640;
const VIEW_H = 420;
const M = { top: 30, right: 88, bottom: 40, left: 42 };

export default function PointsRaceChart({
  season,
  lotusLivery,
  ferrariLivery,
  annotations,
}: {
  season: SeasonData;
  lotusLivery: Livery;
  ferrariLivery: Livery;
  annotations?: Record<number, string>;
}) {
  const reduce = useReducedMotion();

  const { lotusPath, ferrariPath, x, y, yTicks, rounds, lotusEnd, ferrariEnd, annoMarks } =
    useMemo(() => {
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

      const annoMarks = annotations
        ? Object.entries(annotations).map(([round, label]) => {
            const rn = Number(round);
            const entry = rounds.find((r) => r.round === rn);
            const [head, ...rest] = label.split(":");
            return {
              round: rn,
              head: head.trim(),
              detail: rest.join(":").trim(),
              cx: x(rn),
              cy: y(entry?.lotus?.points ?? 0),
            };
          })
        : [];

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
      };
    }, [season, annotations]);

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

      {/* sparse round ticks */}
      {rounds
        .filter((_, i) => i % 3 === 0 || i === rounds.length - 1)
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

      {/* annotation (e.g. Monza, R10) */}
      {annoMarks.map((a) => (
        <motion.g
          key={a.round}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={fadeT(reduce ? 0 : 1.05)}
        >
          <line
            x1={a.cx}
            x2={a.cx}
            y1={M.top}
            y2={VIEW_H - M.bottom}
            stroke="var(--ink-muted)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text
            x={a.cx - 8}
            y={M.top + 2}
            textAnchor="end"
            className="font-data"
            fontSize={11}
            fontWeight={700}
            fill="var(--ink)"
          >
            {a.head}
          </text>
          {a.detail && (
            <text
              x={a.cx - 8}
              y={M.top + 17}
              textAnchor="end"
              className="font-data"
              fontSize={10}
              fill="var(--ink-muted)"
            >
              {a.detail}
            </text>
          )}
          <circle
            cx={a.cx}
            cy={a.cy}
            r={4}
            fill={lotusLivery.primary}
            stroke="var(--paper)"
            strokeWidth={1.5}
          />
        </motion.g>
      ))}

      {/* Ferrari line (with casing) */}
      <motion.path d={ferrariPath} fill="none" stroke="var(--paper)" strokeWidth={5} strokeLinecap="round" {...draw} />
      <motion.path d={ferrariPath} fill="none" stroke={ferrariLivery.primary} strokeWidth={2.5} strokeLinecap="round" {...draw} />

      {/* Lotus line (with casing), drawn on top */}
      <motion.path d={lotusPath} fill="none" stroke="var(--paper)" strokeWidth={5} strokeLinecap="round" {...draw} />
      <motion.path d={lotusPath} fill="none" stroke={lotusLivery.primary} strokeWidth={2.5} strokeLinecap="round" {...draw} />

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
