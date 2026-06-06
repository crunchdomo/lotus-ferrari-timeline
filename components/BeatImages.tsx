"use client";

/**
 * BeatImages — renders a beat's photo. A single image shows plainly; a pair
 * (a "split" beat, e.g. JPS Lotus vs Ferrari at its nadir) becomes a segmented
 * toggle that crossfades between the two marques, which is the beat's whole
 * point made interactive. Honours prefers-reduced-motion.
 */

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SectionImage } from "@/data/content";

function Credit({ image }: { image: SectionImage }) {
  if (!image.credit) return null;
  return (
    <figcaption className="font-data text-[0.65rem] uppercase text-ink-muted">
      {image.creditUrl ? (
        <a
          href={image.creditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-hairline underline-offset-2 hover:text-ink"
        >
          {image.credit}
        </a>
      ) : (
        image.credit
      )}
    </figcaption>
  );
}

export default function BeatImages({ images }: { images: SectionImage[] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const multiple = images.length > 1;
  const active = images[index] ?? images[0];
  const fade = reduce ? { duration: 0 } : { duration: 0.35, ease: "easeInOut" as const };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {multiple && (
        <div className="flex w-full overflow-hidden rounded-sm border border-hairline font-data text-[0.7rem] uppercase tracking-wide">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
              className={
                "flex-1 px-4 py-1.5 transition-colors " +
                (i > 0 ? "border-l border-hairline " : "") +
                (i === index
                  ? "bg-ink text-paper"
                  : "text-ink-muted hover:text-ink")
              }
            >
              {img.label ?? `0${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <figure className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="relative min-h-0 w-full flex-1">
          <AnimatePresence mode="wait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={active.src}
              src={active.src}
              alt={active.alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              className="absolute inset-0 h-full w-full rounded-sm object-contain"
            />
          </AnimatePresence>
        </div>
        <Credit image={active} />
      </figure>
    </div>
  );
}
