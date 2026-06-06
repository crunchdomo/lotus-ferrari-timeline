/**
 * content.ts
 * Narrative prose for the timeline, keyed by Section id.
 *
 * PLACEHOLDER COPY (build step 2). Short, in the author's voice, no lorem.
 * The finished essay sections replace these; structure and keys stay.
 * House style: no em-dashes in user-facing copy.
 */

export interface Hero {
  kicker: string;
  title: string;
  standfirst: string;
}

export const HERO: Hero = {
  kicker: "Lotus vs Ferrari, 1958 to 1978",
  title: "An idea against an institution",
  standfirst:
    "Colin Chapman spent twenty years inventing the modern racing car. Ferrari spent the same twenty years being Ferrari. The rivalry is a lens on what each marque chose to become.",
};

/** One or more short paragraphs per section. */
export const CONTENT: Record<string, string[]> = {
  arrival: [
    "When Lotus arrived in Formula One, Ferrari was already a myth with a balance sheet. One was a way of thinking about weight and adhesion. The other was a way of thinking about itself.",
    "The points say almost nothing yet. The premise is what matters: an idea had entered a room built for institutions.",
  ],
  "clark-peak": [
    "The Type 25 put the driver inside the structure instead of on top of it. The monocoque was lighter, stiffer, and faster, and it made the spaceframe look like furniture.",
    "Clark and Chapman turned a clever chassis into a method. Ferrari answered with horsepower and heritage, which is to say with the things it already had.",
  ],
  dfv: [
    "The Cosworth DFV won on its debut and then rewrote the economics of the sport. A customer could now buy a competitive engine, bolt it to a tub, and beat the factory.",
    "For Ferrari, which built its own everything, this was not just a fast engine. It was an argument about whether the institution was still necessary.",
  ],
  seventy: [
    "The Type 72 was a wedge with its radiators moved and its braking rethought. The 312B was a flat-twelve answer that nearly took the title back.",
    "Then Monza. Rindt was killed in practice and won the championship anyway, the only posthumous champion the sport has had. The cost of the idea arrived in full.",
  ],
  jps: [
    "Gold Leaf had already painted the cars in cigarette colors. John Player Special finished the thought: black and gold, the team as a brand before the sport understood branding.",
    "Across the garage, Ferrari sank to its lowest ebb. The institution looked least like itself precisely when the idea looked most like the future.",
  ],
  "ground-effect": [
    "The Type 79 sealed the underbody and let the air do the holding down. Ground effect was Chapman's last masterpiece, a car that cornered as if the rules had changed.",
    "It was also nearly the end of the method. After Chapman, invention at Lotus slowed, and the institution it had spent two decades provoking simply kept going.",
  ],
  epilogue: [
    "Lotus became a story you tell about ideas. Ferrari became the thing the ideas were told to.",
    "The rivalry is settled, but the question it framed is not: what survives, the team that keeps inventing or the institution that keeps existing?",
  ],
};
