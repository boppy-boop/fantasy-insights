'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PlayerHeadshot from '@/components/PlayerHeadshot';
import {
  weeks2025,
  type LeaguePowerRanking,
  type StrengthOfSchedule,
  type WeekData,
} from '@/lib/season2025';
import {
  fetchUserSeasons,
  fetchLeagues,
  fetchStandings,
  fetchScoreboard,
  type TeamStanding,
  type Matchup,
} from '@/lib/yahoo';

/** Minimal league shape we can safely work with on the client */
type YahooLeagueLite = { league_key: string; name: string };

/** Extract nfl seasons (years) from an unknown Yahoo payload */
function extractSeasons(raw: unknown): number[] {
  try {
    const s = JSON.stringify(raw);
    const years = Array.from(new Set(Array.from(s.matchAll(/nfl\.(\d{4})/g)).map((m) => Number(m[1]))));
    return years.sort((a, b) => b - a);
  } catch {
    return [2025];
  }
}

/** Best-effort parser to pull out { league_key, name } from Yahoo's nested JSON */
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
    // de-dupe by key
    const seen = new Set<string>();
    return out.filter((l) => (seen.has(l.league_key) ? false : (seen.add(l.league_key), true)));
  } catch {
    return [];
  }
}

function weekIdToNumber(weekId?: string | null): number | null {
  if (!weekId) return null;
  if (weekId === 'preseason') return 0;
  const m = weekId.match(/^week(\d{1,2})$/i);
  return m ? Number(m[1]) : null;
}

export default function FantasyPage() {
  // Static content (left)
  const [tab, setTab] = useState<'powerRankings' | 'stealsOverpays' | 'strengthOfSchedule'>('powerRankings');
  const [activeWeekId, setActiveWeekId] = useState<string>('preseason');
  const activeWeek: WeekData | undefined = useMemo(
    () => weeks2025.find((w) => w.id === activeWeekId),
    [activeWeekId]
  );

  // Yahoo content (right)
  const [seasons, setSeasons] = useState<number[]>([2025]);
  const [season, setSeason] = useState<number>(2025);
  const [leagues, setLeagues] = useState<YahooLeagueLite[]>([]);
  const [leagueKey, setLeagueKey] = useState<string>('');
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load seasons on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
        const raw = await fetchUserSeasons();
        if (!alive) return;
        const yrs = extractSeasons(raw);
        if (yrs.length) {
          setSeasons(yrs);
          if (!yrs.includes(season)) setSeason(yrs[0]);
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load seasons');
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load leagues whenever season changes
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setLeagues([]);
        setLeagueKey('');
        const raw = await fetchLeagues(String(season));
        if (!alive) return;
        const ls = coerceLeagueList(raw);
        setLeagues(ls);
        if (ls.length) setLeagueKey(ls[0].league_key);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load leagues');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [season]);

  // Load Yahoo data for the selected week + league
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!leagueKey) return;
      try {
        setLoading(true);
        setError(null);

        // Standings (season-wide)
        await fetchStandings(leagueKey).catch(() => null);

        // Scoreboard (per-week matchups) — only call when we have a real week number (W1+)
        const weekNum = weekIdToNumber(activeWeekId);
        if (typeof weekNum === 'number' && weekNum > 0) {
          await fetchScoreboard(leagueKey, weekNum).catch(() => null);
        }

        if (!alive) return;
        // TODO: plug real parsers; keep empty arrays for now to avoid type errors
        setStandings([]);
        setMatchups([]);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load league data');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [leagueKey, activeWeekId]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-3xl font-black tracking-tight">Fantasy Insights 2025</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Weekly power rankings, steals/overpays, and strength of schedule. Connect your Yahoo account to unlock
            standings and live matchups.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-3">
        {/* Left: content */}
        <div className="lg:col-span-2">
          {/* Week selector */}
          <div className="mb-4 flex flex-wrap gap-2">
            {weeks2025.map((w) => (
              <button
                key={w.id}
                onClick={() => setActiveWeekId(w.id)}
                className={`rounded px-3 py-1 text-sm ${
                  activeWeekId === w.id ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {w.shortLabel}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            {(['powerRankings', 'stealsOverpays', 'strengthOfSchedule'] as const).map((t) => {
              const isActive = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded px-3 py-1 text-sm capitalize ${
                    isActive ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {t.replace(/([A-Z])/g, ' $1')}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="space-y-6">
            {activeWeek && tab === 'powerRankings' && (
              <section>
                <h3 className="mb-4 text-lg font-bold tracking-tight">League Power Rankings</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {activeWeek.content.powerRankings.map((row: LeaguePowerRanking, idx: number) => (
                    <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-sm font-bold">
                          {row.rank}
                        </span>
                        <div className="font-semibold">{row.team}</div>
                      </div>
                      {row.players?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {row.players.map((p, i) => (
                            <span key={i} className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-2 py-1">
                              <PlayerHeadshot name={p.name} src={p.image} size={20} />
                              <span className="text-xs">{p.name}</span>
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-3 text-sm text-zinc-400">{row.analysis}</p>
                      {row.likelihood && <p className="mt-2 text-xs text-zinc-500">Likelihood: {row.likelihood}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeWeek && tab === 'stealsOverpays' && (
              <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <h3 className="mb-4 text-lg font-bold tracking-tight">Auction Steals & Overpays</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-zinc-300">Steals</h4>
                    <ul className="list-inside list-disc text-sm text-zinc-400">
                      {activeWeek.content.stealsOverpays.steals.map((s, i) => (
                        <li key={i}>
                          {s.player} — {s.cost} ({s.team})
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-zinc-300">Overpays</h4>
                    <ul className="list-inside list-disc text-sm text-zinc-400">
                      {activeWeek.content.stealsOverpays.overpays.map((s, i) => (
                        <li key={i}>
                          {s.player} — {s.cost} ({s.team})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {activeWeek && tab === 'strengthOfSchedule' && (
              <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <h3 className="mb-4 text-lg font-bold tracking-tight">Strength of Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase text-zinc-400">
                      <tr>
                        <th className="px-3 py-2">Team</th>
                        <th className="px-3 py-2">Opp Difficulty</th>
                        <th className="px-3 py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {activeWeek.content.strengthOfSchedule.map((row: StrengthOfSchedule, i: number) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium">{row.team}</td>
                          {/* Uses correct fields from lib/season2025.ts: grade + analysis */}
                          <td className="px-3 py-2">{row.grade}</td>
                          <td className="px-3 py-2 text-zinc-400">{row.analysis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Right: Yahoo controls + preview */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <h3 className="mb-4 text-lg font-bold tracking-tight">Yahoo — Season &amp; League</h3>

            {/* Season */}
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

            {/* League */}
            <label className="mb-2 block text-xs font-semibold text-zinc-400">League</label>
            <select
              className="mb-4 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm"
              value={leagueKey}
              onChange={(e) => setLeagueKey(e.target.value)}
              disabled={!leagues.length}
            >
              {leagues.map((lg) => (
                <option key={lg.league_key} value={lg.league_key}>
                  {lg.name}
                </option>
              ))}
            </select>

            {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
            {loading && <p className="mb-2 text-xs text-zinc-400">Loading…</p>}

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

          {/* Standings preview */}
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <h4 className="mb-3 text-sm font-semibold text-zinc-300">
              Standings (Week {weekIdToNumber(activeWeekId) ?? '—'})
            </h4>
            {standings.length ? (
              <ul className="space-y-2">
                {standings.map((row) => (
                  <li key={row.team.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlayerHeadshot name={row.team.name} src={row.team.logo ?? undefined} size={20} />
                      <span className="text-sm">{row.team.name}</span>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {row.wins}-{row.losses}{row.ties ? `-${row.ties}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">No standings available.</p>
            )}
          </div>

          {/* Matchups preview */}
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <h4 className="mb-3 text-sm font-semibold text-zinc-300">Matchups</h4>
            {matchups.length ? (
              <ul className="space-y-2">
                {matchups.map((m, i) => (
                  <li key={i} className="text-sm">
                    {/* Customize when real parser lands */}
                    Matchup {i + 1}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">No matchups available.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
