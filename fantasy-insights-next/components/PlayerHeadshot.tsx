"use client";

import { useState } from "react";
import { HEADSHOTS } from "@/lib/headshots";

/**
 * A resilient headshot component:
 * - Tries multiple URLs per player (NFL, then NCF).
 * - If all fail, shows a nice initials avatar.
 * - Size can be set; defaults to 56px (bigger than before).
 */
export default function PlayerHeadshot({
  name,
  size = 56,
  className = "",
  ring = true,
}: {
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const urls = HEADSHOTS[name] || [];
  const [idx, setIdx] = useState(0);
  const url = urls[idx];

  // Final fallback: initials bubble
  if (!url) {
    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("");
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-zinc-800 text-zinc-200 ${ring ? "ring-1 ring-zinc-700" : ""} ${className}`}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.38), minWidth: size }}
        title={name}
        aria-label={name}
      >
        {initials || "?"}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      title={name}
      width={size}
      height={size}
      className={`rounded-full object-cover ${ring ? "ring-1 ring-zinc-700" : ""} ${className}`}
      style={{ width: size, height: size, minWidth: size }}
      onError={() => {
        // Try next URL if available, otherwise zero out to show initials fallback
        setIdx((prev) => {
          const next = prev + 1;
          return next < urls.length ? next : urls.length; // urls.length => will hit fallback on re-render
        });
      }}
    />
  );
}
