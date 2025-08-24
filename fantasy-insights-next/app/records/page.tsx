// app/records/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import PlayerHeadshot from "@/components/PlayerHeadshot";
import {
  fetchSeasons,
  fetchLeaguesBySeason,
  fetchStandings,
  type YahooLeague,
  type TeamStanding,
} from "@/lib/yahoo";

type Podium = {
  champion?: TeamStanding;
  runnerUp?: TeamStanding;
  third?: TeamStanding;
};

export default function RecordsPage() {
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

  // Load seasons (ensure 2025 always present)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingSeasons(true);
        const s = await fetchSeasons();
        if (!active) return;
        const merged = Array.from(new Set(["2025", ...s])).sort((a, b) => Number(b) - Number(a));
        setSeasons(merged);
        // If initial is not in list, snap to newest
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

  // Load leagues for selected season
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLeaguesError(null);
        setLoadingLeagues(true);
        setLeagues([]);
        setLeagueKey(""); // clear when season changes
        const ls = await fetchLeaguesBySeason(season);
        if (!active) return;
        setLeagues(ls);
        if (ls[0]?.leagueKey) setLeagueKey(ls[0].leagueKey);
      } catch (e) {
        if (!active) return;
        setLeaguesError(e instanceof Error ? e.message : "Failed to load leagues for this season");
      } finally {
        if (active) setLoadingLeagues(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [season]);

  // Load standings for selected league
  useEffect(() => {
    let active = true;
    const ac = new AbortController();
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

  // Compute podium from standings (rank 1..3)
  const podium: Podium = useMemo(() => {
    const sorted = [...(standings ?? [])].sort((a, b) => (a.rank || 999) - (b.rank || 999));
    return {
      champion: sorted[0],
      runnerUp: sorted[1],
      third: sorted[2],
    };
  }, [standings]);

  // Quick all-time leaderboard data structure (extend later)
  // For now we just echo the current league's standings ordered.
  const leaderboard = useMemo(() => {
    return [...(standings ?? [])].sort((a, b) => (a.rank || 999) - (b.rank || 999));
  }, [standings]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-red-400">Hall of Fame</p>
              <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Championship Records & Leaderboard
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-300">
                Celebrate champions, finalists, and legends across your seasons.
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

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <label htmlFor="league" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              League
            </label>
            <select
              id="league"
              value={leagueKey}
              onChange={(e) => setLeagueKey(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
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
            {loadingLeagues && <p className="mt-1 text-[11px] text-zinc-500">Loading leagues…</p>}
            {leaguesError && <p className="mt-1 text-[11px] text-amber-400">{leaguesError}</p>}
          </div>
        </div>
      </section>

      {/* Podium */}
      <section className="mx-auto max-w-7xl px-6 pb-10 lg:px-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
          <h2 className="mb-4 text-2xl font-bold text-white">Championship Podium</h2>

          {loadingStandings ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-zinc-800" />
              ))}
            </div>
          ) : standingsError ? (
            <div className="rounded-lg border border-amber-900/60 bg-amber-950/40 p-3 text-amber-300">
              {standingsError}
            </div>
          ) : standings.length === 0 ? (
            <p className="text-zinc-400">No standings available.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Runner-Up (left) */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Runner-Up</p>
                {podium.runnerUp ? (
                  <div className="mt-2 flex items-center gap-3">
                    <PlayerHeadshot name={podium.runnerUp.teamName} size={56} />
                    <div>
                      <p className="text-sm font-semibold text-white">{podium.runnerUp.teamName}</p>
                      <p className="text-xs text-zinc-400">
                        Rank #{podium.runnerUp.rank} • {podium.runnerUp.wins}-{podium.runnerUp.losses}
                        {podium.runnerUp.ties ? `-${podium.runnerUp.ties}` : ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-400">—</p>
                )}
              </div>

              {/* Champion (center) */}
              <div className="rounded-xl border border-yellow-700/50 bg-yellow-900/20 p-4 ring-1 ring-yellow-400/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-yellow-300">Champion</p>
                {podium.champion ? (
                  <div className="mt-2 flex items-center gap-3">
                    <PlayerHeadshot name={podium.champion.teamName} size={64} />
                    <div>
                      <p className="text-base font-semibold text-white">{podium.champion.teamName}</p>
                      <p className="text-xs text-zinc-300">
                        Rank #{podium.champion.rank} • {podium.champion.wins}-{podium.champion.losses}
                        {podium.champion.ties ? `-${podium.champion.ties}` : ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-400">—</p>
                )}
              </div>

              {/* Third (right) */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Third</p>
                {podium.third ? (
                  <div className="mt-2 flex items-center gap-3">
                    <PlayerHeadshot name={podium.third.teamName} size={56} />
                    <div>
                      <p className="text-sm font-semibold text-white">{podium.third.teamName}</p>
                      <p className="text-xs text-zinc-400">
                        Rank #{podium.third.rank} • {podium.third.wins}-{podium.third.losses}
                        {podium.third.ties ? `-${podium.third.ties}` : ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-400">—</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard (current league) */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
          <h2 className="mb-4 text-2xl font-bold text-white">Leaderboard</h2>

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
          ) : leaderboard.length === 0 ? (
            <p className="text-zinc-400">No leaderboard to display.</p>
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
                  {leaderboard.map((t) => (
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
