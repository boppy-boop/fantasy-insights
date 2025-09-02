// app/history/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PlayerHeadshot from '@/components/PlayerHeadshot';
import {
  fetchUserSeasons,
  fetchLeagues,
  fetchStandings,
  type TeamStanding,
} from '@/lib/yahoo';

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

export default function HistoryPage() {
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
        setError(null);
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

  // Load leagues for selected season
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

  // Load standings (used as a proxy for past champions list later)
  useEffect(() => {
    let active = true;
    (async () => {
      if (!leagueKey) return;
      try {
        setLoading(true);
        setError(null);
        await fetchStandings(leagueKey).catch(() => null);
        if (!active) return;
        setStandings([]); // plug real parser later
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

  const timeline = useMemo(() => {
    // placeholder structure until we wire parsers
    return seasons.map((y) => ({ year: y, champion: null as TeamStanding | null }));
  }, [seasons]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-black tracking-tight">League History</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Pick a season & league to view past champions and notable records.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
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

          <div className="md:col-span-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-3 text-lg font-bold tracking-tight">Champions Timeline</h3>
              <ul className="space-y-3">
                {timeline.map((row) => (
                  <li key={row.year} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{row.year}</span>
                    {row.champion ? (
                      <div className="flex items-center gap-2">
                        <PlayerHeadshot name={row.champion.team.name} src={row.champion.team.logo ?? undefined} size={20} />
                        <span className="text-sm">{row.champion.team.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-zinc-500">—</span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-zinc-500">Historical parsing to be connected next.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
