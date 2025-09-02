// app/records/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import PlayerHeadshot from '@/components/PlayerHeadshot';
import {
  fetchUserSeasons,
  fetchLeagues,
  fetchStandings,
  type TeamStanding,
} from '@/lib/yahoo';
import Link from 'next/link';

type YahooLeagueLite = { league_key: string; name: string };

function extractSeasons(raw: unknown): number[] {
  try {
    const s = JSON.stringify(raw);
    const years = Array.from(new Set(Array.from(s.matchAll(/nfl\.(\d{4})/g)).map((m) => Number(m[1]))));
    return years.sort((a, b) => b - a);
  } catch {
    return [2025];
  }
}

function coerceLeagueList(raw: unknown): YahooLeagueLite[] {
  try {
    const s = JSON.stringify(raw);
    const keys = Array.from(s.matchAll(/"league_key"\s*:\s*"([^"]+)"/g)).map((m) => m[1]);
    const names = Array.from(s.matchAll(/"name"\s*:\s*"([^"]+)"/g)).map((m) => m[1]);
    const out: YahooLeagueLite[] = [];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const n = names[i] ?? keys[i];
      if (k && typeof k === 'string') out.push({ league_key: k, name: String(n) });
    }
    const seen = new Set<string>();
    return out.filter((l) => (seen.has(l.league_key) ? false : (seen.add(l.league_key), true)));
  } catch {
    return [];
  }
}

type Podium = {
  champion?: TeamStanding;
  runnerUp?: TeamStanding;
  third?: TeamStanding;
};

export default function RecordsPage() {
  const [seasons, setSeasons] = useState<number[]>([2025]);
  const [season, setSeason] = useState<number>(2025);
  const [leagues, setLeagues] = useState<YahooLeagueLite[]>([]);
  const [leagueKey, setLeagueKey] = useState<string>('');
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load seasons
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await fetchUserSeasons();
        if (!active) return;
        const yrs = extractSeasons(raw);
        setSeasons(yrs.length ? yrs : [2025]);
        if (yrs.length && !yrs.includes(season)) setSeason(yrs[0]);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load seasons');
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load leagues
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setLeagues([]);
        setLeagueKey('');
        const raw = await fetchLeagues(String(season));
        if (!active) return;
        const ls = coerceLeagueList(raw);
        setLeagues(ls);
        if (ls[0]) setLeagueKey(ls[0].league_key);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load leagues');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [season]);

  // Load standings
  useEffect(() => {
    let active = true;
    (async () => {
      if (!leagueKey) return;
      try {
        setLoading(true);
        setError(null);
        await fetchStandings(leagueKey).catch(() => null);
        if (!active) return;
        setStandings([]); // real parsing to be added
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load standings');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [leagueKey]);

  // Compute podium from standings (rank 1..3)
  const podium: Podium = useMemo(() => {
    const sorted = [...standings].sort((a, b) => (a.rank || 999) - (b.rank || 999));
    return {
      champion: sorted[0],
      runnerUp: sorted[1],
      third: sorted[2],
    };
  }, [standings]);

  // Leaderboard (for now mirror standings)
  const leaderboard = useMemo(() => {
    return [...standings].sort((a, b) => (a.rank || 999) - (b.rank || 999));
  }, [standings]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-2xl font-black tracking-tight">League Records</h1>
        <p className="mt-2 text-sm text-zinc-400">Podiums, best seasons, and more — per league & season.</p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Controls */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <label className="mb-2 block text-xs font-semibold text-zinc-400">Season</label>
            <select
              className="mb-4 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm"
              value={String(season)}
              onChange={(e) => setSeason(Number(e.target.value))}
            >
              {seasons.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <label className="mb-2 block text-xs font-semibold text-zinc-400">League</label>
            <select
              className="mb-2 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm"
              value={leagueKey}
              onChange={(e) => setLeagueKey(e.target.value)}
              disabled={!leagues.length}
            >
              {leagues.map((l) => (
                <option key={l.league_key} value={l.league_key}>
                  {l.name}
                </option>
              ))}
            </select>

            {error && <p className="text-xs text-red-400">{error}</p>}
            {loading && <p className="text-xs text-zinc-400">Loading…</p>}
            {!leagues.length && (
              <p className="text-sm text-zinc-400">
                No leagues found. You may need to{' '}
                <Link href="/signin" className="underline">
                  sign in with Yahoo
                </Link>
                .
              </p>
            )}
          </div>

          {/* Podium */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-3 text-lg font-bold tracking-tight">Season Podium</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-zinc-800 p-4">
                  <h4 className="text-sm font-semibold text-zinc-300">Champion</h4>
                  {podium.champion ? (
                    <div className="mt-2 flex items-center gap-2">
                      <PlayerHeadshot name={podium.champion.team.name} src={podium.champion.team.logo ?? undefined} />
                      <div className="text-sm">{podium.champion.team.name}</div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-500">—</p>
                  )}
                </div>
                <div className="rounded-lg bg-zinc-800 p-4">
                  <h4 className="text-sm font-semibold text-zinc-300">Runner-up</h4>
                  {podium.runnerUp ? (
                    <div className="mt-2 flex items-center gap-2">
                      <PlayerHeadshot name={podium.runnerUp.team.name} src={podium.runnerUp.team.logo ?? undefined} />
                      <div className="text-sm">{podium.runnerUp.team.name}</div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-500">—</p>
                  )}
                </div>
                <div className="rounded-lg bg-zinc-800 p-4">
                  <h4 className="text-sm font-semibold text-zinc-300">Third place</h4>
                  {podium.third ? (
                    <div className="mt-2 flex items-center gap-2">
                      <PlayerHeadshot name={podium.third.team.name} src={podium.third.team.logo ?? undefined} />
                      <div className="text-sm">{podium.third.team.name}</div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-500">—</p>
                  )}
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-3 text-lg font-bold tracking-tight">Leaderboard</h3>
              {leaderboard.length ? (
                <ul className="space-y-2">
                  {leaderboard.map((row) => (
                    <li key={row.team.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlayerHeadshot name={row.team.name} src={row.team.logo ?? undefined} size={20} />
                        <span className="text-sm">{row.team.name}</span>
                      </div>
                      <span className="text-xs text-zinc-400">
                        {row.wins}-{row.losses}
                        {row.ties ? `-${row.ties}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">No standings available.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
