"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchMatchups,
  fetchStandings,
  type MatchupsResponse,
  type StandingsResponse,
} from "@/lib/yahoo";

type RecordRow = { label: string; value: string; sub?: string };

export default function RecordsPage() {
  const [season] = useState<string>("2025");
  const [leagueKey] = useState<string | undefined>(undefined);
  const [weeks] = useState<number[]>([1, 2]); // extend when you add more sample weeks
  const [standings, setStandings] = useState<StandingsResponse | null>(null);
  const [matchupsByWeek, setMatchupsByWeek] = useState<Record<number, MatchupsResponse>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const st = await fetchStandings({ season, leagueKey, signal: ac.signal });
        if (!active) return;
        const map: Record<number, MatchupsResponse> = {};
        for (const w of weeks) {
          const mr = await fetchMatchups({ season, leagueKey, week: w, signal: ac.signal });
          if (!active) return;
          map[w] = mr;
        }
        setStandings(st);
        setMatchupsByWeek(map);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load records");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      ac.abort();
    };
  }, [season, leagueKey, weeks]);

  const rows: RecordRow[] = useMemo(() => {
    if (!standings) return [];

    const seedByTeam = new Map<string, number>(
      standings.standings.map((s) => [s.teamName, s.rank])
    );

    let highestScore: { week: number; team: string; score: number } | null = null;
    let largestBlowout: { week: number; home: string; away: string; margin: number } | null = null;
    let closestWin: { week: number; home: string; away: string; margin: number } | null = null;
    let biggestUpset: {
      week: number;
      winner: string;
      loser: string;
      delta: number;
      margin: number;
    } | null = null;

    const weeksSorted = Object.keys(matchupsByWeek)
      .map((k) => Number(k))
      .sort((a, b) => a - b);

    for (const w of weeksSorted) {
      const mrs = matchupsByWeek[w];
      for (const m of mrs.matchups) {
        const home = m.home;
        const away = m.away;

        // highest single-week score
        const topSide = home.score >= away.score ? home : away;
        if (!highestScore || topSide.score > highestScore.score) {
          highestScore = { week: w, team: topSide.teamName, score: topSide.score };
        }

        // margins
        const margin = Math.abs(home.score - away.score);
        if (!largestBlowout || margin > largestBlowout.margin) {
          largestBlowout = { week: w, home: home.teamName, away: away.teamName, margin };
        }
        if (!closestWin || margin < closestWin.margin) {
          closestWin = { week: w, home: home.teamName, away: away.teamName, margin };
        }

        // upset: winner seed > loser seed
        const homeSeed = seedByTeam.get(home.teamName) ?? 999;
        const awaySeed = seedByTeam.get(away.teamName) ?? 999;
        const winner = home.score >= away.score ? home : away;
        const loser = winner === home ? away : home;
        const winnerSeed = seedByTeam.get(winner.teamName) ?? 999;
        const loserSeed = seedByTeam.get(loser.teamName) ?? 999;
        const delta = winnerSeed - loserSeed; // positive means upset (higher-numbered seed beat lower-numbered)
        if (delta > 0) {
          if (!biggestUpset || delta > biggestUpset.delta || (delta === biggestUpset.delta && margin > biggestUpset.margin)) {
            biggestUpset = { week: w, winner: winner.teamName, loser: loser.teamName, delta, margin };
          }
        }
      }
    }

    const out: RecordRow[] = [];
    if (highestScore) {
      out.push({
        label: "Highest Single-Week Score",
        value: `${highestScore.team} — ${highestScore.score.toFixed(1)}`,
        sub: `Week ${highestScore.week}, ${season}`,
      });
    }
    if (largestBlowout) {
      out.push({
        label: "Largest Blowout",
        value: `${largestBlowout.home} vs ${largestBlowout.away} — +${largestBlowout.margin.toFixed(1)}`,
        sub: `Week ${largestBlowout.week}, ${season}`,
      });
    }
    if (closestWin) {
      out.push({
        label: "Closest Win",
        value: `${closestWin.home} vs ${closestWin.away} — Δ ${closestWin.margin.toFixed(1)}`,
        sub: `Week ${closestWin.week}, ${season}`,
      });
    }
    if (biggestUpset) {
      out.push({
        label: "Biggest Upset",
        value: `${biggestUpset.winner} over ${biggestUpset.loser} — seed +${biggestUpset.delta}`,
        sub: `Week ${biggestUpset.week}, margin +${biggestUpset.margin.toFixed(1)}`,
      });
    }

    // Season-to-date team PF/PA leaders
    const pfLeader = [...standings.standings].sort((a, b) => b.pointsFor - a.pointsFor)[0];
    const paLeader = [...standings.standings].sort((a, b) => a.pointsAgainst - b.pointsAgainst)[0];
    if (pfLeader) {
      out.push({
        label: "Most Points For (Season to Date)",
        value: `${pfLeader.teamName} — ${pfLeader.pointsFor.toFixed(1)}`,
      });
    }
    if (paLeader) {
      out.push({
        label: "Fewest Points Against (Season to Date)",
        value: `${paLeader.teamName} — ${paLeader.pointsAgainst.toFixed(1)}`,
      });
    }

    return out;
  }, [season, standings, matchupsByWeek]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <p className="text-sm uppercase tracking-widest text-red-400">League Leaderboards</p>
          <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Records
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-300">
            Automatically computed from weekly matchups and season standings. Updates as new weeks are added.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-zinc-900" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-900/60 bg-amber-950/40 p-4 text-sm text-amber-300">
            Failed to load records. {error}
          </div>
        ) : !standings ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
            No standings available.
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
            No records yet for {season}.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r, i) => (
              <article
                key={`${r.label}-${i}`}
                className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rotate-12 rounded-full bg-red-700/10 blur-2xl" />
                <p className="text-sm font-semibold text-zinc-300">{r.label}</p>
                <p className="mt-1 text-lg font-bold text-white">{r.value}</p>
                {r.sub && <p className="text-sm text-zinc-400">{r.sub}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
