// components/ThisWeek.tsx
"use client";

import type { Matchup, TeamStanding } from "@/lib/yahoo";
import { computeWeeklyInsights, type WeeklyInsights } from "@/lib/insights";

type Props = {
  weekLabel: string;
  matchups: Matchup[];
  standings: TeamStanding[];
  loading?: boolean;
  error?: string | null;
};

export default function ThisWeek({
  weekLabel,
  matchups,
  standings,
  loading = false,
  error = null,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-sm uppercase tracking-wider text-zinc-400">Weekly Notes</h3>
        <p className="mt-2 text-zinc-400">Loading {weekLabel}…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-900/40 bg-red-900/10 p-6">
        <h3 className="text-sm uppercase tracking-wider text-red-400">Weekly Notes</h3>
        <p className="mt-2 text-red-300">{error}</p>
      </div>
    );
  }

  const insights: WeeklyInsights = computeWeeklyInsights(matchups ?? [], standings ?? []);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
      <h3 className="text-sm uppercase tracking-wider text-zinc-400">Weekly Notes</h3>

      {/* Team of the Week */}
      <div className="rounded-lg border border-zinc-800 bg-emerald-900/20 p-4">
        <div className="text-xs uppercase tracking-wider text-zinc-400">Team of the Week</div>
        {insights.teamOfWeek ? (
          <p className="mt-1">
            <span className="font-semibold text-white">{insights.teamOfWeek.teamName}</span>{" "}
            <span className="text-emerald-300">{insights.teamOfWeek.score.toFixed(1)}</span>
          </p>
        ) : (
          <p className="mt-1 text-zinc-400">No results yet.</p>
        )}
      </div>

      {/* Blowout */}
      <div className="rounded-lg border border-zinc-800 bg-fuchsia-900/20 p-4">
        <div className="text-xs uppercase tracking-wider text-zinc-400">Blowout Meter</div>
        {insights.blowout ? (
          <p className="mt-1">
            <span className="text-white">{insights.blowout.home}</span> vs{" "}
            <span className="text-white">{insights.blowout.away}</span>{" "}
            — <span className="text-fuchsia-300">Δ {insights.blowout.margin.toFixed(1)}</span>
          </p>
        ) : (
          <p className="mt-1 text-zinc-400">No blowout yet.</p>
        )}
      </div>

      {/* Closest */}
      <div className="rounded-lg border border-zinc-800 bg-blue-900/20 p-4">
        <div className="text-xs uppercase tracking-wider text-zinc-400">Photo Finish</div>
        {insights.closest ? (
          <p className="mt-1">
            <span className="text-white">{insights.closest.home}</span> vs{" "}
            <span className="text-white">{insights.closest.away}</span>{" "}
            — <span className="text-blue-300">Δ {insights.closest.margin.toFixed(1)}</span>
          </p>
        ) : (
          <p className="mt-1 text-zinc-400">No nail-biters yet.</p>
        )}
      </div>

      {/* Upsets */}
      <div className="rounded-lg border border-zinc-800 bg-amber-900/20 p-4">
        <div className="text-xs uppercase tracking-wider text-zinc-400">Upsets</div>
        {insights.upsets.length > 0 ? (
          <ul className="mt-1 space-y-1">
            {insights.upsets.map((u, i) => (
              <li key={i} className="text-amber-200">
                <span className="text-white">{u.winner}</span> over{" "}
                <span className="text-white">{u.loser}</span> — seed Δ {u.seedDiff}, margin{" "}
                {u.margin.toFixed(1)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-zinc-400">No upsets recorded.</p>
        )}
      </div>
    </div>
  );
}
