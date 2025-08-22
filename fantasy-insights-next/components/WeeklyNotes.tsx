"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchMatchups,
  fetchStandings,
  computeWeeklyInsights,
  type Matchup,
  type MatchupsResponse,
  type StandingsResponse,
} from "@/lib/yahoo";
import { weeks2025 } from "@/lib/season2025";

/** Waiver wire types (local to this component) */
type WaiverMove = {
  player: string;
  position: string;
  image: string;
  addedByTeamKey: string;
  addedByTeamName: string;
  faab: number; // winning bid
  tag: "steal" | "overpay" | "solid";
  blurb: string;
};
type WaiversResponse = {
  season: string;
  leagueKey: string;
  week: number;
  transactions: WaiverMove[];
};

type Props = {
  season: string;
  leagueKey?: string;
  week: number; // 0 = preseason
};

function smallestMargin(matchups: Matchup[]): { matchup: Matchup; margin: number } | null {
  let best: { matchup: Matchup; margin: number } | null = null;
  for (const m of matchups) {
    const mar = Math.abs(m.home.score - m.away.score);
    if (best === null || mar < best.margin) best = { matchup: m, margin: mar };
  }
  return best;
}

export default function WeeklyNotes({ season, leagueKey, week }: Props) {
  const isPreseason = week === 0;
  const showPreseason2025 = isPreseason && season === "2025";

  // Preseason (2025) data from your rich content
  const pre = useMemo(() => {
    if (!showPreseason2025) return null;
    return weeks2025.find((w) => w.id === "preseason") ?? null;
  }, [showPreseason2025]);

  // In-season data
  const [standings, setStandings] = useState<StandingsResponse | null>(null);
  const [matchups, setMatchups] = useState<MatchupsResponse | null>(null);
  const [waivers, setWaivers] = useState<WaiversResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(!isPreseason);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPreseason) return; // no API fetch; we use static preseason content
    let active = true;
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [st, ma, wa] = await Promise.all([
          fetchStandings({ season, leagueKey, signal: ac.signal }),
          fetchMatchups({ season, leagueKey, week, signal: ac.signal }),
          (async (): Promise<WaiversResponse> => {
            const sp = new URLSearchParams({ season, week: String(week) });
            if (leagueKey) sp.set("leagueKey", leagueKey);
            const res = await fetch(`/api/yahoo/waivers?${sp.toString()}`, {
              cache: "no-store",
              signal: ac.signal,
            });
            if (!res.ok) throw new Error(`Waivers HTTP ${res.status}`);
            const json = (await res.json()) as WaiversResponse;
            return json;
          })(),
        ]);
        if (!active) return;
        setStandings(st);
        setMatchups(ma);
        setWaivers(wa);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load notes");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      ac.abort();
    };
  }, [isPreseason, season, leagueKey, week]);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
      <h3 className="mb-3 text-xl font-bold text-white">
        {isPreseason ? "Preseason Notes" : "Weekly Notes"}
      </h3>

      {/* PRESEASON (2025) */}
      {showPreseason2025 && pre ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Power Rankings Top 5 */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h4 className="text-sm font-semibold text-zinc-300">Top 5 Power Snapshot</h4>
            <ol className="mt-2 space-y-1 text-sm text-zinc-200">
              {pre.content.powerRankings.slice(0, 5).map((t) => (
                <li key={t.rank}>
                  #{t.rank} <span className="font-medium">{t.team}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Draft Steals */}
          <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-4">
            <h4 className="text-sm font-semibold text-emerald-300">Draft Heists (Top 3)</h4>
            <ul className="mt-2 space-y-1 text-sm text-emerald-100">
              {pre.content.stealsOverpays.steals.slice(0, 3).map((s, i) => (
                <li key={`${s.player}-${i}`}>
                  {s.player} ({s.cost}) → <span className="font-medium">{s.team}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Overpays */}
          <div className="rounded-xl border border-red-900/60 bg-red-950/40 p-4">
            <h4 className="text-sm font-semibold text-red-300">Overpays That Might Sting</h4>
            <ul className="mt-2 space-y-1 text-sm text-red-100">
              {pre.content.stealsOverpays.overpays.slice(0, 3).map((o, i) => (
                <li key={`${o.player}-${i}`}>
                  {o.player} ({o.cost}) — <span className="font-medium">{o.team}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SoS */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 lg:col-span-3">
            <h4 className="text-sm font-semibold text-zinc-300">Strength of Schedule Watch</h4>
            <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {pre.content.strengthOfSchedule.slice(0, 6).map((s) => (
                <div key={s.team} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm">
                  <p className="font-medium text-zinc-100">{s.team}</p>
                  <p className="text-zinc-300">
                    Grade: <span className="font-semibold text-emerald-300">{s.grade}</span>
                  </p>
                  {s.biggestGame && (
                    <p className="text-zinc-400">
                      🔥 {s.biggestGame.week} vs {s.biggestGame.opponent}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : isPreseason ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
          Preseason notes not available for season {season}.
        </div>
      ) : /* IN-SEASON (weeks 1..17) */ loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-amber-900/60 bg-amber-950/40 p-4 text-sm text-amber-300">
          Weekly notes unavailable. {error}
        </div>
      ) : !standings || !matchups ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
          No data for this week yet.
        </div>
      ) : (
        (() => {
          const insights = computeWeeklyInsights(matchups.matchups, standings.standings);
          const closest = smallestMargin(matchups.matchups);

          const waiverSteals =
            waivers?.transactions.filter((t) => t.tag === "steal").slice(0, 3) ?? [];
          const waiverOverpays =
            waivers?.transactions.filter((t) => t.tag === "overpay").slice(0, 3) ?? [];

          return (
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Headliner */}
              <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-4">
                <h4 className="text-sm font-semibold text-emerald-300">Headliner</h4>
                {insights.teamOfWeek ? (
                  <p className="mt-1 text-zinc-200">
                    <span className="font-semibold">{insights.teamOfWeek.teamName}</span> posted{" "}
                    <span className="text-emerald-300 font-semibold">
                      {insights.teamOfWeek.score.toFixed(1)}
                    </span>{" "}
                    — Team of the Week.
                  </p>
                ) : (
                  <p className="mt-1 text-zinc-400 text-sm">No standout performance yet.</p>
                )}
              </div>

              {/* Blowout */}
              <div className="rounded-xl border border-fuchsia-900/60 bg-fuchsia-950/40 p-4">
                <h4 className="text-sm font-semibold text-fuchsia-300">Blowout Meter</h4>
                {insights.blowout ? (
                  <p className="mt-1 text-zinc-200">
                    {insights.blowout.matchup.home.teamName} vs {insights.blowout.matchup.away.teamName} —{" "}
                    <span className="text-fuchsia-300 font-semibold">+{insights.blowout.margin.toFixed(1)}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-zinc-400 text-sm">No blowouts recorded.</p>
                )}
              </div>

              {/* Photo Finish */}
              <div className="rounded-xl border border-sky-900/60 bg-sky-950/40 p-4">
                <h4 className="text-sm font-semibold text-sky-300">Photo Finish</h4>
                {closest ? (
                  <p className="mt-1 text-zinc-200">
                    {closest.matchup.home.teamName} vs {closest.matchup.away.teamName} —{" "}
                    <span className="text-sky-300 font-semibold">Δ {closest.margin.toFixed(1)}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-zinc-400 text-sm">No games to compare.</p>
                )}
              </div>

              {/* Waiver-based Steals & Overpays */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-3">
                <h4 className="text-sm font-semibold text-zinc-300">
                  Steals &amp; Overpays — Waiver Wire (Week {week})
                </h4>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  {/* Waiver Steals */}
                  <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-4">
                    <p className="mb-2 text-emerald-300 font-semibold">Steals</p>
                    {waiverSteals.length > 0 ? (
                      <ul className="space-y-3">
                        {waiverSteals.map((mv, i) => (
                          <li key={`${mv.player}-${i}`} className="flex items-start gap-3">
                            <img
                              src={mv.image}
                              alt={mv.player}
                              className="h-10 w-10 rounded-full border border-emerald-800 object-cover"
                              onError={(ev) => {
                                const el = ev.currentTarget as HTMLImageElement;
                                el.style.display = "none";
                              }}
                            />
                            <div className="text-sm text-zinc-200">
                              <p className="font-semibold">
                                {mv.player} {mv.position ? `(${mv.position})` : ""} — {mv.addedByTeamName}
                              </p>
                              <p className="text-emerald-200">FAAB ${mv.faab}</p>
                              <p className="text-zinc-300">{mv.blurb}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-400">No waiver steals recorded.</p>
                    )}
                  </div>

                  {/* Waiver Overpays */}
                  <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-4">
                    <p className="mb-2 text-red-300 font-semibold">Overpays</p>
                    {waiverOverpays.length > 0 ? (
                      <ul className="space-y-3">
                        {waiverOverpays.map((mv, i) => (
                          <li key={`${mv.player}-${i}`} className="flex items-start gap-3">
                            <img
                              src={mv.image}
                              alt={mv.player}
                              className="h-10 w-10 rounded-full border border-red-800 object-cover"
                              onError={(ev) => {
                                const el = ev.currentTarget as HTMLImageElement;
                                el.style.display = "none";
                              }}
                            />
                            <div className="text-sm text-zinc-200">
                              <p className="font-semibold">
                                {mv.player} {mv.position ? `(${mv.position})` : ""} — {mv.addedByTeamName}
                              </p>
                              <p className="text-red-200">FAAB ${mv.faab}</p>
                              <p className="text-zinc-300">{mv.blurb}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-400">No waiver overpays recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </section>
  );
}
