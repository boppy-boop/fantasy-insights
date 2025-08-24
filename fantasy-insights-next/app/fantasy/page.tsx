// app/fantasy/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

import PlayerHeadshot from "@/components/PlayerHeadshot";

import {
  fetchSeasons,
  fetchLeaguesBySeason,
  fetchStandings,
  fetchLeagueMeta,
  fetchMatchups,
  type YahooLeague,
  type TeamStanding,
  type Matchup,
  type LeagueMeta,
} from "@/lib/yahoo";

import { computeWeeklyInsights, type WeeklyInsights } from "@/lib/insights";

import {
  weeks2025,
  type LeaguePowerRanking,
  type PlayerFace,
  type StealOverpayEntry,
  type StrengthOfSchedule,
  type WeekData,
} from "@/lib/season2025";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export default function FantasyDashboard() {
  const { data: session, status } = useSession();
  const sp = useSearchParams();
  const router = useRouter();

  // URL query defaults
  const initialSeason = sp.get("season") ?? "2025";
  const initialLeagueKey = sp.get("leagueKey") ?? "";
  const initialWeekParam = Number(sp.get("week") ?? "0");

  const [season, setSeason] = useState<string>(initialSeason);
  const [leagueKey, setLeagueKey] = useState<string>(initialLeagueKey);
  const [selectedWeek, setSelectedWeek] = useState<number>(
    Number.isFinite(initialWeekParam) ? initialWeekParam : 0
  );

  // Collections
  const [seasons, setSeasons] = useState<string[]>(["2025"]);
  const [leagues, setLeagues] = useState<YahooLeague[]>([]);

  // League meta (gates week tabs)
  const [meta, setMeta] = useState<LeagueMeta>({
    startWeek: 1,
    endWeek: 17,
    currentWeek: 0,
  });

  // In-season data
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [insights, setInsights] = useState<WeeklyInsights | null>(null);

  // Loading & errors
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingWeek, setLoadingWeek] = useState(false);

  const [leaguesError, setLeaguesError] = useState<string | null>(null);
  const [weekError, setWeekError] = useState<string | null>(null);

  // Keep URL in sync
  useEffect(() => {
    const q = new URLSearchParams();
    if (season) q.set("season", season);
    if (leagueKey) q.set("leagueKey", leagueKey);
    q.set("week", String(selectedWeek));
    router.replace(`/fantasy?${q.toString()}`);
  }, [season, leagueKey, selectedWeek, router]);

  // Load seasons (ensure 2025 present)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingSeasons(true);
        const s = await fetchSeasons();
        if (!active) return;
        const merged = Array.from(new Set(["2025", ...s])).sort(
          (a, b) => Number(b) - Number(a)
        );
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

  // Load leagues for the chosen season
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLeaguesError(null);
        setLoadingLeagues(true);
        setLeagues([]);

        if (status !== "authenticated") return;

        const ls = await fetchLeaguesBySeason(season);
        if (!active) return;

        setLeagues(ls);
        if (!ls.find((l) => l.leagueKey === leagueKey)) {
          setLeagueKey(ls[0]?.leagueKey ?? "");
        }
      } catch (e) {
        if (!active) return;
        setLeaguesError(
          e instanceof Error ? e.message : "Failed to load leagues"
        );
      } finally {
        if (active) setLoadingLeagues(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [season, status, leagueKey]);

  // Load league meta when leagueKey changes
  useEffect(() => {
    let active = true;
    const ac = new AbortController();
    (async () => {
      if (!leagueKey) {
        setMeta({ startWeek: 1, endWeek: 17, currentWeek: 0 });
        return;
      }
      try {
        setLoadingMeta(true);
        const m = await fetchLeagueMeta({ leagueKey, signal: ac.signal });
        if (!active) return;

        setMeta(m);

        // Clamp an already-selected week (if necessary)
        if (selectedWeek > 0) {
          const safe = clamp(
            selectedWeek,
            m.startWeek,
            m.currentWeek || m.startWeek
          );
          if (safe !== selectedWeek) setSelectedWeek(safe);
        }
      } catch {
        if (!active) return;
        setMeta({ startWeek: 1, endWeek: 17, currentWeek: 0 });
      } finally {
        if (active) setLoadingMeta(false);
      }
    })();

    return () => {
      active = false;
      ac.abort();
    };
  }, [leagueKey, selectedWeek]);

  // Load week data (only when week > 0)
  useEffect(() => {
    let active = true;
    const ac = new AbortController();

    (async () => {
      if (!leagueKey || selectedWeek <= 0) {
        setStandings([]);
        setMatchups([]);
        setInsights(null);
        setWeekError(null);
        return;
      }
      try {
        setLoadingWeek(true);
        setWeekError(null);

        const [{ standings: s }, { matchups: ms }] = await Promise.all([
          fetchStandings({ leagueKey, season, signal: ac.signal }),
          fetchMatchups({
            leagueKey,
            week: selectedWeek,
            signal: ac.signal,
          }),
        ]);

        if (!active) return;

        setStandings(s);
        setMatchups(ms);
        setInsights(computeWeeklyInsights(ms, s));
      } catch (e) {
        if (!active) return;
        setWeekError(
          e instanceof Error ? e.message : "Failed to load weekly data"
        );
      } finally {
        if (active) setLoadingWeek(false);
      }
    })();

    return () => {
      active = false;
      ac.abort();
    };
  }, [leagueKey, season, selectedWeek]);

  // Week tabs derived from meta
  const weekTabs = useMemo(() => {
    const tabs: Array<{ id: number; label: string; disabled: boolean }> = [];
    tabs.push({ id: 0, label: "Preseason", disabled: false });

    const start = meta.startWeek || 1;
    const end = meta.endWeek || 17;
    const curr = meta.currentWeek || 0;

    for (let w = start; w <= end; w++) {
      tabs.push({
        id: w,
        label: `Week ${w}`,
        disabled: curr === 0 ? true : w > curr,
      });
    }
    return tabs;
  }, [meta]);

  // rename param to avoid 'w' shadow/linters
 const preseason: WeekData | undefined = useMemo(
  () => weeks2025.find((wk: WeekData) => wk.id === "preseason"),
  []
);

  const firstName = useMemo(() => {
    const raw = session?.user?.name ?? "";
    const f = raw.trim().split(/\s+/)[0];
    return f || "Manager";
  }, [session]);

  const showSignIn = status !== "authenticated";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-red-400">
                Dashboard
              </p>
              <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {showSignIn ? "Fantasy Insights" : `Welcome back, ${firstName}`}
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-300">
                {meta.currentWeek === 0
                  ? "Preseason is live. Regular-season weeks unlock automatically once Yahoo posts Week 1."
                  : `We’re in Week ${meta.currentWeek}. Select any available week below.`}
              </p>
            </div>

            {showSignIn ? (
              <button
                onClick={() => signIn("yahoo")}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500"
              >
                Sign in with Yahoo
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Season */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Season
            </label>
            <select
              value={season}
              onChange={(e) => {
                setSeason(e.target.value);
                setSelectedWeek(0);
              }}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
              disabled={loadingSeasons}
            >
              {seasons.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* League */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              League
            </label>
            <div className="mt-1 flex gap-2">
              <select
                value={leagueKey}
                onChange={(e) => {
                  setLeagueKey(e.target.value);
                  setSelectedWeek(0);
                }}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                disabled={loadingLeagues || leagues.length === 0 || showSignIn}
              >
                {leagues.length === 0 ? (
                  <option value="" disabled>
                    {showSignIn ? "Sign in to load leagues" : "No leagues found"}
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
                href="/history"
                className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
              >
                History
              </Link>
            </div>
            {leaguesError && (
              <p className="mt-1 text-[11px] text-amber-400">{leaguesError}</p>
            )}
          </div>
        </div>
      </section>

      {/* Week Tabs */}
      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {weekTabs.map((tab) => {
            const isActive = selectedWeek === tab.id;
            const base =
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors";
            const enabled = isActive
              ? "bg-red-600 text-white"
              : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700";
            const disabled = "opacity-50 cursor-not-allowed";
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedWeek(tab.id)}
                disabled={tab.disabled}
                aria-pressed={isActive}
                className={`${base} ${tab.disabled ? disabled : enabled}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {loadingMeta && (
          <p className="mt-2 text-[11px] text-zinc-500">
            Checking league schedule…
          </p>
        )}
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        {selectedWeek === 0 ? (
          <PreseasonBlock week={preseason} />
        ) : (
          <LiveWeekBlock
            weekNumber={selectedWeek}
            matchups={matchups}
            standings={standings}
            insights={insights}
            loading={loadingWeek}
            error={weekError}
          />
        )}
      </section>
    </main>
  );
}

/* -------------------- Blocks -------------------- */

function PreseasonBlock({ week }: { week?: WeekData }) {
  if (!week) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
        No preseason data available.
      </div>
    );
  }
  const content = week.content;

  return (
    <div className="space-y-10">
      {/* Power Rankings */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
        <h2 className="mb-6 text-2xl font-bold text-white">
          Post-Draft Power Rankings
        </h2>
        <div className="space-y-6">
          {content.powerRankings.map((t: LeaguePowerRanking) => (
            <div
              key={t.rank}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-transform hover:scale-[1.01]"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl font-semibold text-white">
                  #{t.rank}
                </span>
                <span className="text-lg font-semibold text-white">
                  {t.team}
                </span>
                <div className="ml-2 flex flex-wrap gap-1">
                  {t.players?.map((p: PlayerFace, i: number) => (
                    <PlayerHeadshot key={i} name={p.name} size={40} />
                  ))}
                </div>
              </div>
              <p className="text-zinc-300">{t.analysis}</p>
              {t.likelihood && (
                <p className="mt-1 text-sm text-zinc-400 italic">
                  Likelihood: {t.likelihood}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steals & Overpays */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-green-900/40 bg-green-950/20 p-6 shadow-2xl ring-1 ring-green-800/20">
          <h3 className="mb-4 text-xl font-semibold text-green-300">
            Draft Steals
          </h3>
          <div className="space-y-3">
            {content.stealsOverpays.steals.map(
              (s: StealOverpayEntry, i: number) => (
                <div
                  key={i}
                  className="rounded-lg border border-green-800/50 bg-zinc-900/70 p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <PlayerHeadshot name={s.player} size={48} />
                    <div>
                      <p className="font-medium text-white">
                        {s.player}{" "}
                        <span className="text-green-300">({s.cost})</span>
                      </p>
                      <p className="text-xs text-zinc-400">{s.team}</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300">{s.reason}</p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 shadow-2xl ring-1 ring-red-800/20">
          <h3 className="mb-4 text-xl font-semibold text-red-300">
            Draft Overpays
          </h3>
          <div className="space-y-3">
            {content.stealsOverpays.overpays.map(
              (o: StealOverpayEntry, i: number) => (
                <div
                  key={i}
                  className="rounded-lg border border-red-800/50 bg-zinc-900/70 p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <PlayerHeadshot name={o.player} size={48} />
                    <div>
                      <p className="font-medium text-white">
                        {o.player}{" "}
                        <span className="text-red-300">({o.cost})</span>
                      </p>
                      <p className="text-xs text-zinc-400">{o.team}</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300">{o.reason}</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Strength of Schedule */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
        <h3 className="mb-4 text-xl font-semibold text-white">
          Strength of Schedule
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {content.strengthOfSchedule.map((sos: StrengthOfSchedule) => (
            <div
              key={sos.team}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-base font-semibold text-white">{sos.team}</p>
                <span className="text-sm font-semibold text-emerald-300">
                  {sos.grade}
                </span>
              </div>
              <p className="text-sm text-zinc-300">{sos.analysis}</p>
              {sos.biggestGame && (
                <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/60 p-3">
                  <p className="text-sm text-purple-300">
                    🔥 Biggest Game: {sos.biggestGame.week} vs{" "}
                    {sos.biggestGame.opponent}
                  </p>
                  <p className="mt-1 text-xs text-zinc-300">
                    {sos.biggestGame.narrative}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// If these types aren't already imported at the top of this file, add them:
// import type { Matchup, TeamStanding } from "@/lib/yahoo";
// import type { WeeklyInsights } from "@/lib/insights";
// import PlayerHeadshot from "@/components/PlayerHeadshot";

type LiveWeekBlockProps = {
  weekNumber: number;
  matchups: Matchup[];
  standings: TeamStanding[];
  insights: WeeklyInsights | null;
  loading: boolean;
  error: string | null;
};

function LiveWeekBlock({
  weekNumber,
  matchups,
  standings,
  insights,
  loading,
  error,
}: LiveWeekBlockProps) {
  // We don't use standings in this block yet; avoid the lint warning.
  void standings;
  // (If you also don't use matchups yet, silence that too:)
  void matchups;

  return (
    <div className="space-y-6">
      <h3 className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-xl font-semibold text-white shadow-2xl ring-1 ring-black/10">
        Weekly Notes
      </h3>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Team of the Week */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              Team of the Week
            </p>
            {insights?.teamOfWeek ? (
              <div className="mt-2 flex items-center gap-3">
                <PlayerHeadshot name={insights.teamOfWeek.teamName} size={40} />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {insights.teamOfWeek.teamName}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {insights.teamOfWeek.score.toFixed(1)} pts
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
            {insights?.blowout ? (
              <p className="mt-1 text-sm text-zinc-300">
                {insights.blowout.home} vs {insights.blowout.away} •{" "}
                <span className="text-red-300">
                  {insights.blowout.margin.toFixed(1)} pts
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
            {insights?.closest ? (
              <p className="mt-1 text-sm text-zinc-300">
                {insights.closest.home} vs {insights.closest.away} •{" "}
                <span className="text-emerald-300">
                  {insights.closest.margin.toFixed(1)} pts
                </span>
              </p>
            ) : (
              <p className="text-zinc-400">—</p>
            )}
          </div>
        </div>
      )}

      {/* Waiver-Wire Steals & Overpays — placeholder (until Yahoo transactions are wired) */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
        <h4 className="mb-3 text-lg font-semibold text-white">
          Steals &amp; Overpays
        </h4>
        <p className="text-xs text-zinc-400">
          Coming next: we’ll analyze weekly transactions to auto-tag best value
          and dubious bids.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-emerald-800 bg-emerald-950/20 p-4">
            <p className="text-sm font-semibold text-emerald-300">Top Steals</p>
            <p className="mt-2 text-sm text-zinc-400">
              No data yet for Week {weekNumber}.
            </p>
          </div>
          <div className="rounded-lg border border-red-800 bg-red-950/20 p-4">
            <p className="text-sm font-semibold text-red-300">Top Overpays</p>
            <p className="mt-2 text-sm text-zinc-400">
              No data yet for Week {weekNumber}.
            </p>
          </div>
        </div>
      </div>
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
