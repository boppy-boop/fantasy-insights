// components/WeeklyNotes.tsx
"use client";

import type { WeeklyInsights } from "../lib/insights";
import PlayerHeadshot from "./PlayerHeadshot";

type Props = {
  insights: WeeklyInsights | null;
  loading: boolean;
  className?: string;
};

export default function WeeklyNotes({ insights, loading, className }: Props) {
  return (
    <div
      className={
        "rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10 " +
        (className ?? "")
      }
    >
      <h3 className="mb-4 text-xl font-semibold text-white">Weekly Notes</h3>

      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-zinc-800" />
          ))}
        </div>
      ) : !insights ? (
        <p className="text-zinc-400">No notes yet.</p>
      ) : (
        (() => {
          const { teamOfWeek, blowout, closest } = insights;
          return (
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Team of the Week */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  Team of the Week
                </p>
                {teamOfWeek ? (
                  <div className="mt-2 flex items-center gap-3">
                    <PlayerHeadshot name={teamOfWeek.teamName} size={40} />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {teamOfWeek.teamName}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {teamOfWeek.score.toFixed(1)} pts
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-400">—</p>
                )}
              </div>

              {/* Blowout */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  Blowout
                </p>
                {blowout ? (
                  <p className="mt-1 text-sm text-zinc-300">
                    {blowout.home} vs {blowout.away} •{" "}
                    <span className="text-red-300">
                      {blowout.margin.toFixed(1)} pts
                    </span>
                  </p>
                ) : (
                  <p className="text-zinc-400">—</p>
                )}
              </div>

              {/* Closest Game */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  Closest Game
                </p>
                {closest ? (
                  <p className="mt-1 text-sm text-zinc-300">
                    {closest.home} vs {closest.away} •{" "}
                    <span className="text-emerald-300">
                      {closest.margin.toFixed(1)} pts
                    </span>
                  </p>
                ) : (
                  <p className="text-zinc-400">—</p>
                )}
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
