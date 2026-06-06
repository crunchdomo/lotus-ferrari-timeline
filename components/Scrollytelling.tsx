"use client";

/**
 * Scrollytelling.tsx — build step 2 skeleton.
 *
 * One sticky visual panel; the narrative beats (SECTIONS) scroll past it.
 * Desktop: panel pinned beside the narrative column. Mobile: panel pinned
 * above, narrative scrolls beneath. Active beat is derived from scroll via
 * motion's useScroll + useMotionValueEvent (no raw scroll listeners).
 *
 * The panel currently just announces each beat (id, kind, livery). It is the
 * seam where the persistent morphing chart and tech-diagram SVGs land next.
 */

import { useRef, useState } from "react";
import {
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { SECTIONS, FERRARI_LIVERY, type SeasonData } from "@/data/types";
import { CONTENT, SECTION_IMAGES } from "@/data/content";
import PointsRaceChart from "@/components/PointsRaceChart";
import season1958 from "@/data/seasons/1958.json";
import season1967 from "@/data/seasons/1967.json";
import season1970 from "@/data/seasons/1970.json";

// Committed season data, keyed by year, for the points-race beats.
const SEASON_DATA: Record<number, SeasonData> = {
  1958: season1958 as unknown as SeasonData,
  1967: season1967 as unknown as SeasonData,
  1970: season1970 as unknown as SeasonData,
};

export default function Scrollytelling() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduce = useReducedMotion();

  const { scrollY, scrollYProgress } = useScroll();

  // Active beat = the section whose center is nearest the reading line
  // (~55% down, below the mobile top panel). getBoundingClientRect keeps this
  // correct regardless of unequal section heights.
  useMotionValueEvent(scrollY, "change", () => {
    const line = window.innerHeight * 0.55;
    let best = 0;
    let bestDist = Infinity;
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const dist = Math.abs(center - line);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActiveIndex((prev) => (prev === best ? prev : best));
  });

  const active = SECTIONS[activeIndex];
  const fade = reduce
    ? { duration: 0 }
    : { duration: 0.4, ease: "easeOut" as const };

  // Points-race beats render the live chart if their season data is wired.
  const seasonForBeat =
    active.visual === "points-race" ? SEASON_DATA[active.years[0]] : undefined;
  // A supplied image takes priority over the chart / SVG / placeholder.
  const beatImage = SECTION_IMAGES[active.id];

  return (
    <>
      {/* Scroll progress rail */}
      <motion.div
        className="fixed inset-x-0 top-0 z-30 h-0.5 origin-left bg-accent"
        style={{ scaleX: scrollYProgress }}
        aria-hidden
      />

      <div className="relative md:grid md:grid-cols-[1fr_1.1fr]">
        {/* ---- Sticky visual panel ---- */}
        <aside
          className="sticky top-0 z-10 flex h-[42vh] flex-col justify-between border-b border-hairline bg-paper-2 p-6 md:col-start-2 md:row-start-1 md:h-screen md:border-b-0 md:border-l md:p-10"
        >
          <div className="flex items-center justify-between font-data text-[0.7rem] uppercase text-ink-muted">
            <span>{active.kicker}</span>
            <span>
              {String(activeIndex + 1).padStart(2, "0")} / {String(SECTIONS.length).padStart(2, "0")}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -8 }}
              transition={fade}
              className="flex min-h-0 flex-1 flex-col gap-4"
            >
              {beatImage ? (
                // A supplied photograph/diagram for this beat.
                <figure className="flex min-h-0 flex-1 flex-col gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={beatImage.src}
                    alt={beatImage.alt}
                    className="min-h-0 w-full flex-1 rounded-sm object-contain"
                  />
                  {beatImage.credit && (
                    <figcaption className="font-data text-[0.65rem] uppercase text-ink-muted">
                      {beatImage.creditUrl ? (
                        <a
                          href={beatImage.creditUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-hairline underline-offset-2 hover:text-ink"
                        >
                          {beatImage.credit}
                        </a>
                      ) : (
                        beatImage.credit
                      )}
                    </figcaption>
                  )}
                </figure>
              ) : seasonForBeat ? (
                // The persistent morphing chart for points-race beats.
                <div className="min-h-0 flex-1">
                  <PointsRaceChart
                    season={seasonForBeat}
                    lotusLivery={active.lotusLivery}
                    ferrariLivery={FERRARI_LIVERY}
                    annotations={active.annotations}
                  />
                </div>
              ) : (
                // Placeholder for beats whose visual is not wired yet.
                <h2 className="font-display text-2xl leading-tight md:text-4xl">
                  {active.title}
                </h2>
              )}

              {/* Livery comparison; doubles as the chart legend. */}
              <div className="mt-2 flex flex-col gap-2 font-data text-xs text-ink-muted">
                <LiverySwatch
                  label={`Lotus · ${active.lotusLivery.label}`}
                  primary={active.lotusLivery.primary}
                  secondary={active.lotusLivery.secondary}
                />
                <LiverySwatch
                  label={`Ferrari · ${FERRARI_LIVERY.label}`}
                  primary={FERRARI_LIVERY.primary}
                  secondary={FERRARI_LIVERY.secondary}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          <p className="font-data text-[0.65rem] uppercase text-ink-muted">
            {active.years.length ? active.years.join("–") : "epilogue"}
          </p>
        </aside>

        {/* ---- Narrative column ---- */}
        <div className="md:col-start-1 md:row-start-1">
          {SECTIONS.map((s, i) => (
            <section
              key={s.id}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              data-section={s.id}
              className="mx-auto flex min-h-screen max-w-prose flex-col justify-center gap-5 px-6 py-24 md:px-12"
            >
              <span className="font-data text-xs uppercase tracking-widest text-ink-muted">
                {s.kicker}
              </span>
              <h3 className="font-display text-3xl leading-tight md:text-5xl">
                {s.title}
              </h3>
              {CONTENT[s.id]?.map((para, j) => (
                <p key={j} className="text-lg leading-relaxed text-ink/90">
                  {para}
                </p>
              ))}
              {s.annotations && (
                <ul className="mt-2 border-l-2 border-accent/40 pl-4 font-data text-xs text-ink-muted">
                  {Object.entries(s.annotations).map(([round, note]) => (
                    <li key={round}>
                      R{round}: {note}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function LiverySwatch({
  label,
  primary,
  secondary,
}: {
  label: string;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-3 w-6 rounded-sm border border-black/10"
        style={{
          background: `linear-gradient(90deg, ${primary} 0 60%, ${secondary} 60% 100%)`,
        }}
      />
      <span>{label}</span>
    </div>
  );
}
