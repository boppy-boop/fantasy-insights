// app/history/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PlayerHeadshot from "@/components/PlayerHeadshot";
import {
  fetchSeasons,
  fetchLeaguesBySeason,
  fetchStandings,
  type YahooLeague,
  type TeamStanding,
} from "@/lib/yahoo";

export default function HistoryPage() {
  const [season, setSeason] = useState<string>("2025");
  const [seasons, setSeasons] = useState<string[]>(["2025"]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);

  const [leagues, setLeagues] = useState<YahooLeague[]>([]);
  const [leagueKey, setLeagueKey] = useState<string>("");
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [leaguesError, setLeaguesError] = useState<string | null>(null);

  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);

  // Load seasons (ensure 2025 present)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingSeasons(true);
        const s = await fetchSeasons();
        if (!active) return;
        const merged = Array.from(new Set(["2025", ...s])).sort((a, b) => Number(b) - Number(a));
        setSeasons(merged);
        if (!merged.includes(season)) setSeason(merged[0] ?? "2025");
      } finally {
        if (active) setLoadingSeasons(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load leagues when season changes
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLeaguesError(null);
        setLoadingLeagues(true);
        setLeagues([]);
        setLeagueKey("");
        const ls = await fetchLeaguesBySeason(season);
        if (!active) return;
        setLeagues(ls);
        if (ls[0]?.leagueKey) setLeagueKey(ls[0].leagueKey);
      } catch (e) {
        if (!active) return;
        setLeaguesError(e instanceof Error ? e.message : "Failed to load leagues");
      } finally {
        if (active) setLoadingLeagues(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [season]);

  // Load standings when league changes
  useEffect(() => {
    const ac = new AbortController();
    let active = true;
    (async () => {
      if (!leagueKey) {
        setStandings([]);
        return;
      }
      try {
        setStandingsError(null);
        setLoadingStandings(true);
        const res = await fetchStandings({ season, leagueKey, signal: ac.signal });
        if (!active) return;
        setStandings(res.standings ?? []);
      } catch (e) {
        if (!active) return;
        setStandingsError(e instanceof Error ? e.message : "Failed to load standings");
      } finally {
        if (active) setLoadingStandings(false);
      }
    })();
    return () => {
      active = false;
      ac.abort();
    };
  }, [season, leagueKey]);

  const champion = useMemo(() => {
    if (!standings || standings.length === 0) return null;
    return [...standings].sort((a, b) => (a.rank || 999) - (b.rank || 999))[0] ?? null;
  }, [standings]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-red-400">Archive</p>
              <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                League History
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-300">
                Jump into any season and league, preview standings, then open the dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <label htmlFor="season" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Season
            </label>
            <select
              id="season"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
              disabled={loadingSeasons}
            >
              {seasons.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {loadingSeasons && <p className="mt-1 text-[11px] text-zinc-500">Loading seasons…</p>}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:col-span-2">
            <label htmlFor="league" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              League
            </label>
            <div className="mt-1 flex gap-2">
              <select
                id="league"
                value={leagueKey}
                onChange={(e) => setLeagueKey(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                disabled={loadingLeagues || leagues.length === 0}
              >
                {leagues.length === 0 ? (
                  <option value="" disabled>
                    {leaguesError ? "Sign in to Yahoo & refresh" : "No leagues found"}
                  </option>
                ) : (
                  leagues.map((l) => (
                    <option key={l.leagueKey} value={l.leagueKey}>
                      {l.name}
                    </option>
                  ))
                )}
              </select>

              <Link
                href={
                  leagueKey
                    ? `/fantasy?season=${encodeURIComponent(season)}&leagueKey=${encodeURIComponent(leagueKey)}&week=0`
                    : "#"
                }
                aria-disabled={!leagueKey}
                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ${
                  leagueKey
                    ? "bg-red-600 text-white hover:bg-red-500"
                    : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                }`}
              >
                Open Dashboard
              </Link>
            </div>
            {loadingLeagues && <p className="mt-1 text-[11px] text-zinc-500">Loading leagues…</p>}
            {leaguesError && <p className="mt-1 text-[11px] text-amber-400">{leaguesError}</p>}
          </div>
        </div>
      </section>

      {/* Standings Preview */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Standings Preview</h2>
            {champion && (
              <div className="hidden items-center gap-2 rounded-lg border border-yellow-700/50 bg-yellow-900/20 px-3 py-1.5 text-sm ring-1 ring-yellow-400/20 sm:flex">
                <span className="text-yellow-300">Champion:</span>
                <span className="font-medium text-white">{champion.teamName}</span>
              </div>
            )}
          </div>

          {loadingStandings ? (
            <div className="grid gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-md bg-zinc-800" />
              ))}
            </div>
          ) : standingsError ? (
            <div className="rounded-lg border border-amber-900/60 bg-amber-950/40 p-3 text-amber-300">
              {standingsError}
            </div>
          ) : standings.length === 0 ? (
            <p className="text-zinc-400">No standings available for this league.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                    <th className="px-3 py-2">Rank</th>
                    <th className="px-3 py-2">Team</th>
                    <th className="px-3 py-2">W-L-T</th>
                    <th className="px-3 py-2">PF</th>
                    <th className="px-3 py-2">PA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {[...standings]
                    .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                    .map((t) => (
                      <tr key={t.teamKey} className="hover:bg-zinc-800/40">
                        <td className="px-3 py-2 text-zinc-300">#{t.rank}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-3">
                            <PlayerHeadshot name={t.teamName} size={36} rounded="lg" />
                            <span className="font-medium text-white">{t.teamName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-zinc-300">
                          {t.wins}-{t.losses}
                          {t.ties ? `-${t.ties}` : ""}
                        </td>
                        <td className="px-3 py-2 text-zinc-300">{t.pointsFor.toFixed(1)}</td>
                        <td className="px-3 py-2 text-zinc-300">{t.pointsAgainst.toFixed(1)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
