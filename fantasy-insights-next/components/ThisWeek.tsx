"use client";

import { useEffect, useState } from "react";
import {
  fetchMatchups,
  fetchStandings,
  computeWeeklyInsights,
  type MatchupsResponse,
  type StandingsResponse,
  type WeeklyInsights,
} from "@/lib/yahoo";

type Props = {
  season: string;
  leagueKey?: string;
  week: number; // 0 = preseason, 1..17 = regular season
};

export default function ThisWeek({ season, leagueKey, week }: Props) {
  const [standings, setStandings] = useState<StandingsResponse | null>(null);
  const [matchups, setMatchups] = useState<MatchupsResponse | null>(null);
  const [insights, setInsights] = useState<WeeklyInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [st, ma] = await Promise.all([
          fetchStandings({ season, leagueKey, signal: ac.signal }),
          fetchMatchups({ season, leagueKey, week, signal: ac.signal }),
        ]);
        if (!active) return;
        setStandings(st);
        setMatchups(ma);
        setInsights(computeWeeklyInsights(ma.matchups, st.standings));
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load weekly insights");
        setStandings(null);
        setMatchups(null);
        setInsights(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      ac.abort();
    };
  }, [season, leagueKey, week]);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          This Week at a Glance {week === 0 ? "(Preseason)" : `(Week ${week})`}
        </h3>
        <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-semibold text-zinc-300 ring-1 ring-white/10">
          Season {season}
        </span>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-amber-900/60 bg-amber-950/40 p-4 text-sm text-amber-300">
          Weekly insights unavailable. {error}
        </div>
      ) : !insights || !standings || !matchups ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
          No data for this week yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Team of the Week */}
          <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-4">
            <h4 className="text-sm font-semibold text-emerald-300">Team of the Week</h4>
            {insights.teamOfWeek ? (
              <p className="mt-1 text-zinc-200">
                {insights.teamOfWeek.teamName}{" "}
                <span className="text-emerald-300 font-semibold">
                  {insights.teamOfWeek.score.toFixed(1)}
                </span>
              </p>
            ) : (
              <p className="mt-1 text-zinc-400 text-sm">No standout performance yet.</p>
            )}
          </div>

          {/* Blowout */}
          <div className="rounded-xl border border-fuchsia-900/60 bg-fuchsia-950/40 p-4">
            <h4 className="text-sm font-semibold text-fuchsia-300">Blowout</h4>
            {insights.blowout ? (
              <p className="mt-1 text-zinc-200">
                {insights.blowout.matchup.home.teamName} vs {insights.blowout.matchup.away.teamName} ·{" "}
                <span className="text-fuchsia-300 font-semibold">
                  +{insights.blowout.margin.toFixed(1)}
                </span>
              </p>
            ) : (
              <p className="mt-1 text-zinc-400 text-sm">No blowouts recorded.</p>
            )}
          </div>

          {/* Upsets */}
          <div className="rounded-xl border border-amber-900/60 bg-amber-950/40 p-4">
            <h4 className="text-sm font-semibold text-amber-300">Upsets</h4>
            {insights.upsets.length > 0 ? (
              <ul className="mt-1 space-y-1 text-sm text-zinc-200">
                {insights.upsets.map((u, i) => (
                  <li key={i}>
                    {u.matchup.home.teamName} vs {u.matchup.away.teamName} ·{" "}
                    <span className="text-amber-300">winner seed {u.winnerSeed}</span>{" "}
                    <span className="text-zinc-400">over</span>{" "}
                    <span className="text-amber-300">seed {u.loserSeed}</span>{" "}
                    <span className="text-zinc-400">by</span>{" "}
                    <span className="text-amber-300">+{u.margin.toFixed(1)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-zinc-400 text-sm">No upsets this week.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
