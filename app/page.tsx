import Scrollytelling from "@/components/Scrollytelling";
import { HERO } from "@/data/content";

export default function Home() {
  return (
    <main>
      {/* Title hero */}
      <section className="flex min-h-screen flex-col justify-center gap-6 px-6 py-24 md:px-16">
        <span className="font-data text-sm uppercase tracking-widest text-accent">
          {HERO.kicker}
        </span>
        <h1 className="max-w-4xl font-display text-5xl leading-[1.05] md:text-8xl">
          {HERO.title}
        </h1>
        <p className="max-w-2xl text-xl leading-relaxed text-ink/80 md:text-2xl">
          {HERO.standfirst}
        </p>
        <span
          className="mt-8 font-data text-xs uppercase tracking-widest text-ink-muted"
          aria-hidden
        >
          Scroll ↓
        </span>
      </section>

      {/* Pinned visual + narrative beats */}
      <Scrollytelling />

      <footer className="border-t border-hairline bg-paper-2 px-6 py-16 font-data text-xs uppercase tracking-widest text-ink-muted md:px-16">
        Lotus vs Ferrari · a scrollytelling companion · data via Jolpica-F1
      </footer>
    </main>
  );
}
