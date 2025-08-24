// components/PlayerHeadshot.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type Props = {
  /** Display name (used for alt text and initials fallback) */
  name: string;
  /** Optional explicit image url; if not provided or fails, we render initials */
  src?: string;
  /** Size in px (width & height). Default: 36 */
  size?: number;
  /** Rounding style: "full" | "lg" | "md" | "none". Default: "full" */
  rounded?: "full" | "lg" | "md" | "none";
  /** Optional extra class names */
  className?: string;
  /** Optional title tooltip; defaults to name */
  title?: string;
  /** If true, bypass Next image optimization (useful for lots of remote heads) */
  unoptimized?: boolean;
};

export default function PlayerHeadshot({
  name,
  src,
  size = 36,
  rounded = "full",
  className = "",
  title,
  unoptimized = false,
}: Props) {
  const [failed, setFailed] = useState<boolean>(false);

  const initials = useMemo(() => {
    const parts = (name ?? "").trim().split(/\s+/).slice(0, 2);
    const chars = parts.map((p) => p.charAt(0).toUpperCase()).join("");
    return chars || "?";
  }, [name]);

  const hue = useMemo(() => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return h;
  }, [name]);

  const borderRadius =
    rounded === "full" ? "9999px" : rounded === "lg" ? "12px" : rounded === "md" ? "8px" : "0px";

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flex: "0 0 auto",
  };

  const gradientStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, hsl(${hue} 70% 25%) 0%, hsl(${(hue + 30) % 360} 70% 30%) 100%)`,
    color: "white",
    fontWeight: 700,
    fontSize: Math.max(10, Math.round(size * 0.42)),
    letterSpacing: "0.5px",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  const tooltip = title || name;

  // If we have a src and it hasn't failed, render optimized Image
  if (src && !failed) {
    return (
      <span style={containerStyle} className={className} title={tooltip}>
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          unoptimized={unoptimized}
          style={{
            objectFit: "cover",
            width: size,
            height: size,
            borderRadius,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "#0a0a0a",
          }}
        />
      </span>
    );
  }

  // Fallback: colored initials
  return (
    <div style={{ ...containerStyle, ...gradientStyle }} className={className} title={tooltip} aria-label={name}>
      {initials}
    </div>
  );
}
