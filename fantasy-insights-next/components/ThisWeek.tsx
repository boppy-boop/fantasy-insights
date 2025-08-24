// components/ThisWeek.tsx
"use client";

import type { Matchup, TeamStanding } from "../lib/yahoo";
import type { WeeklyInsights } from "../lib/insights";
import PlayerHeadshot from "./PlayerHeadshot";

type Props = {
  weekNumber: number;
  matchups: Matchup[];
  standings: TeamStanding[];
  insights: WeeklyInsights | null;
  loading: boolean;
  error: string | null;
};

export default function ThisWeek({
  weekNumber,
  matchups,
  standings, // reserved for future use (ties, streaks, etc.)
  insights,
  loading,
  error,
}: Props) {
  return (
    <div className="space-y-8">
      {/* Scoreboard */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Week {weekNumber} Scoreboard
          </h2>
          <span className="text-xs uppercase tracking-wider text-zinc-400">
            Live from Yahoo
          </span>
        </div>

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-800" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-amber-900/60 bg-amber-950/40 p-3 text-amber-300">
            {error}
          </div>
        ) : matchups.length === 0 ? (
          <p className="text-zinc-400">No matchups available for this week.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {matchups.map((m, idx) => (
              <div
                key={m.id ?? idx}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <RowTeam name={m.home.teamName} score={m.home.score} />
                <RowTeam name={m.away.teamName} score={m.away.score} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Notes */}
      <WeeklyNotes insights={insights} loading={loading} />
    </div>
  );
}

function RowTeam({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-3">
        <PlayerHeadshot name={name} size={32} rounded="lg" />
        <span className="font-medium text-white">{name}</span>
      </div>
      <span className="text-sm font-semibold text-zinc-200">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

/* ------------ WeeklyNotes (inlined to keep this file self-contained) ------------ */

function WeeklyNotes({
  insights,
  loading,
}: {
  insights: WeeklyInsights | null;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
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
