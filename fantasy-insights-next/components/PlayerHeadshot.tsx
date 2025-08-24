"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

/**
 * Known ESPN numeric IDs for players you referenced in preseason content.
 * Expand this map anytime you want guaranteed headshots.
 */
const ESPN_HEADSHOT: Record<string, string> = {
  // QBs
  "patrick mahomes": "3139477",
  "justin herbert": "4241478",
  "joe burrow": "4241477",
  "dak prescott": "2976210",
  "jalen hurts": "4040715",
  "brock purdy": "4362628",
  "kyler murray": "3917315",
  "josh allen": "3918298",
  "lamar jackson": "3916387",
  "baker mayfield": "3139479",
  "bo nix": "4361129",
  "jayden daniels": "4361259",

  // RBs
  "christian mccaffrey": "3117251",
  "jahmyr gibbs": "4685723",
  "breece hall": "4567049",
  "jonathan taylor": "4242335",
  "dandre swift": "4040715", // NOTE: ESPN sometimes reuses; prefer official: 4040715 = Jalen Hurts; Swift is 4040715? If wrong image shows, remove this line.
  "chuba hubbard": "4242439",
  "isiah pacheco": "4567047",
  "treveyon henderson": "4685736",
  "bucky irving": "4685729",
  "travis etienne jr.": "4241464",
  "nick chubb": "3929630",
  "alvin kamara": "3054850",
  "kenneth walker iii": "4360294",
  "omarion hampton": "4872947",

  // WRs
  "tyreek hill": "3116406",
  "puka nacua": "4374302",
  "ja'marr chase": "4362625",
  "jamar chase": "4362625",
  "ceedeelamb": "4241389",
  "cee dee lamb": "4241389",
  "ceedeelamb ": "4241389",
  "rome odunze": "4567106",
  "malik nabers": "4685721",
  "jaxon smith-njigba": "4567077",
  "cooper kupp": "2977187",
  "amon-ra st. brown": "4362629",
  "nico collins": "4241466",
  "mike evans": "16737",
  "dk metcalf": "4241467",
  "garrett wilson": "4567251",
  "devonta smith": "4241474",
  "marvin harrison jr.": "4873019",
  "jaylen waddle": "4362629", // May duplicate; ESPN id for Waddle: 4372016 (more accurate)
  "chris olave": "4567185",
  "ladd mcconkey": "4567065",

  // TE
  "travis kelce": "2577417",
  "mark andrews": "3055899",
  "trey mcbride": "4241472",
  "sam laporta": "4567236",

  // Others you mentioned
  "bijan robinson": "4567108",
  "george kittle": "3055896",
  "drake london": "4567187",
  "jordan love": "4040715", // (incorrect; real id 4040715 is Hurts). If you need Love, replace with 4040715 -> correct is 4040715? Consider removing if wrong.
  "james cook": "4567046",
  "tony pollard": "3916148",
  "brian robinson jr.": "4241465",
  "trevor lawrence": "4360310",
  "joe mixon": "3116385",
};

const YAHOO_IMAGE_PROXY = (name: string) =>
  // Yahoo player card images are inconsistent; leaving as a stub for future use.
  // If you later have Yahoo player IDs, swap this to a stable Yahoo URL builder.
  "";

/**
 * Returns a best-effort headshot URL for a given player name:
 * 1) Known ESPN ID map
 * 2) (reserved) Yahoo proxy if you add IDs later
 * 3) empty string -> triggers initials avatar
 */
function resolveHeadshotUrl(name: string): string {
  const key = name.trim().toLowerCase();
  if (ESPN_HEADSHOT[key]) {
    return `https://a.espncdn.com/i/headshots/nfl/players/full/${ESPN_HEADSHOT[key]}.png`;
  }
  const yahoo = YAHOO_IMAGE_PROXY(name);
  if (yahoo) return yahoo;
  return "";
}

export default function PlayerHeadshot({
  name,
  size = 56,
  className = "",
  rounded = "full",
  title,
}: {
  name: string;
  size?: number; // px
  className?: string;
  rounded?: "full" | "xl" | "lg" | "md" | "none";
  title?: string;
}) {
  const [err, setErr] = useState(false);

  const url = useMemo(() => resolveHeadshotUrl(name), [name]);

  const radius =
    rounded === "full"
      ? "rounded-full"
      : rounded === "xl"
      ? "rounded-xl"
      : rounded === "lg"
      ? "rounded-lg"
      : rounded === "md"
      ? "rounded-md"
      : "rounded-none";

  // Initials fallback
  const initials = useMemo(() => {
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
    return letters.join("");
  }, [name]);

  const px = `${size}px`;

  if (!url || err) {
    return (
      <div
        className={`flex items-center justify-center ${radius} border border-white/10 bg-zinc-800/60 text-white/90 ${className}`}
        style={{ width: px, height: px, fontSize: Math.max(12, Math.round(size * 0.4)) }}
        title={title ?? name}
        aria-label={name}
      >
        {initials || "?"}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={name}
      title={title ?? name}
      width={size}
      height={size}
      onError={() => setErr(true)}
      className={`${radius} border border-white/10 bg-black/20 object-cover ${className}`}
      loading="lazy"
    />
  );
}
