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

/**
 * Optional image for a beat's visual panel, keyed by Section id. When present,
 * it takes priority over the hand-built SVG / placeholder for that beat.
 * Drop the file in /public/images/ and reference it as "/images/<file>".
 * Use rights-clear images only (Wikimedia Commons, public domain, owned);
 * `credit` renders as a small caption.
 */
export interface SectionImage {
  src: string;
  alt: string;
  credit?: string;
  creditUrl?: string; // link to source / license (required for CC attribution)
  label?: string; // short toggle-button label when a beat has a pair
}

// A beat shows one image, or a pair (rendered side by side) for a split.
export const SECTION_IMAGES: Record<string, SectionImage | SectionImage[]> = {
  "clark-peak": {
    src: "/images/clark-1962-dutch-gp.jpg",
    alt: "Jim Clark in the Lotus 25 at the 1962 Dutch Grand Prix",
    credit: "Photo: Joop van Bilsen / Anefo, CC BY-SA 3.0 NL",
    creditUrl:
      "https://commons.wikimedia.org/wiki/File:Clark_at_1962_Dutch_Grand_Prix.jpg",
  },
  // Split: the black-and-gold ascendant beside red at its nadir.
  "jps": [
    {
      src: "/images/lotus-72-fittipaldi-1971.jpg",
      alt: "Emerson Fittipaldi in the Lotus 72, 1971",
      credit: "Photo: Lothar Spurzem, CC BY-SA 3.0 DE",
      creditUrl:
        "https://commons.wikimedia.org/wiki/File:1971_Emerson_Fittipaldi,_Lotus_72_(kl).JPG",
      label: "Lotus 72",
    },
    {
      src: "/images/ferrari-312b3-1972.jpg",
      alt: "Ferrari 312B3 Spazzaneve, the experimental car of Ferrari's nadir years",
      credit: "Photo: Brian Snelson, CC BY 2.0",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Derek_Bell_2008_Goodwood.jpg",
      label: "Ferrari 312B3",
    },
  ],
  "ground-effect": {
    src: "/images/lotus-79-1978.jpg",
    alt: "Ronnie Peterson's Lotus 79 at Druids, 1978 British Grand Prix",
    credit: "Photo: Martin Lee, CC BY-SA 2.0",
    creditUrl:
      "https://commons.wikimedia.org/wiki/File:Ronnie_Peterson_-_Lotus_79_at_Druids_at_the_1978_British_Grand_Prix_(50050520537).jpg",
  },
  "epilogue": {
    src: "/images/chapman-1979.jpg",
    alt: "Colin Chapman in the pits at the 1979 Race of Champions",
    credit: "Photo: Martin Lee, CC BY-SA 2.0",
    creditUrl:
      "https://commons.wikimedia.org/wiki/File:Colin_Chapman_in_the_pits_at_the_1979_Race_of_Champions_(50140833216).jpg",
  },
};

export const HERO: Hero = {
  kicker: "Lotus vs Ferrari, 1958 to 1978",
  title: "An idea against an institution",
  standfirst:
    "Colin Chapman spent twenty years inventing the modern racing car. Ferrari spent the same twenty years being Ferrari. The rivalry is a lens on what each marque chose to become.",
};

/** One or more short paragraphs per section. */
export const CONTENT: Record<string, string[]> = {
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
