// app/fantasy/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { weeks2025, type WeekData } from "@/lib/season2025";
import ThisWeek from "@/components/ThisWeek";
import WeeklyNotes from "@/components/WeeklyNotes";

type InsightTab = "powerRankings" | "stealsOverpays" | "strengthOfSchedule";

export default function FantasyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read query params (optional)
  const seasonParam = searchParams.get("season");
  const leagueKeyParam = searchParams.get("leagueKey");
  const initialWeekParam = searchParams.get("week"); // e.g., "week3" or "preseason"

  const [activeWeekId, setActiveWeekId] = useState<string>(initialWeekParam || "preseason");
  const [activeTab, setActiveTab] = useState<InsightTab>("powerRankings");

  // If URL week changes (client nav), sync local state
  useEffect(() => {
    if (initialWeekParam && initialWeekParam !== activeWeekId) {
      setActiveWeekId(initialWeekParam);
      setActiveTab("powerRankings");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWeekParam]);

  // Season handling: 2025 has our rich data, other seasons show placeholders
  const season = seasonParam && /^\d{4}$/.test(seasonParam) ? seasonParam : "2025";
  const isSeason2025 = season === "2025";

  // Build week list: 2025 uses the rich dataset; other seasons scaffold 17 empty weeks
  const weeks: WeekData[] = useMemo(() => {
    if (isSeason2025) return weeks2025;
    const scaffold: WeekData[] = [
      {
        id: "preseason",
        shortLabel: "Pre",
        title: `Preseason • ${season}`,
        description:
          "Historical preseason view. Connect standings/matchups to auto-generate draft grades and narratives.",
        content: { powerRankings: [], stealsOverpays: { steals: [], overpays: [] }, strengthOfSchedule: [] },
      },
      ...Array.from({ length: 17 }, (_, i) => {
        const n = i + 1;
        return {
          id: `week${n}`,
          shortLabel: `W${n}`,
          title: `Week ${n} • ${season}`,
          description: "Historic weekly snapshot pending Yahoo integration.",
          content: { powerRankings: [], stealsOverpays: { steals: [], overpays: [] }, strengthOfSchedule: [] },
        } as WeekData;
      }),
    ];
    return scaffold;
  }, [isSeason2025, season]);

  // Find the active week safely
  const activeWeek = useMemo<WeekData>(() => {
    return weeks.find((w) => w.id === activeWeekId) ?? weeks[0];
  }, [weeks, activeWeekId]);

  // Helper: push selected week into the URL (keeps existing params)
  const setWeekInUrl = (weekId: string) => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set("season", season);
    sp.set("week", weekId);
    if (leagueKeyParam) sp.set("leagueKey", leagueKeyParam);
    router.replace(`/fantasy?${sp.toString()}`);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      {/* Hero / Header */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-red-400">2025 Season Dashboard</p>
              <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Rex Grossman Championship S League
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-semibold text-zinc-300 ring-1 ring-white/10">
                  Season {season}
                </span>
                {leagueKeyParam && (
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-semibold text-zinc-300 ring-1 ring-white/10">
                    {leagueKeyParam}
                  </span>
                )}
                {!isSeason2025 && (
                  <span className="rounded-md bg-amber-600/20 px-2 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-600/40">
                    Archive Mode (limited data)
                  </span>
                )}
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/owners"
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
              >
                Owners
              </Link>
              <Link
                href="/history"
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
              >
                History
              </Link>
              <Link
                href="/records"
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
              >
                Records
              </Link>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-300">
            ESPN-style weekly insights, power rankings, draft steals &amp; overpays, and strength-of-schedule. Click a
            week to dive in.
          </p>
        </div>
      </section>

      {/* Week selector */}
      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl ring-1 ring-black/10">
          <div className="flex flex-wrap items-center gap-2">
            {weeks.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setActiveWeekId(w.id);
                  setActiveTab("powerRankings");
                  setWeekInUrl(w.id);
                }}
                className={
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold transition " +
                  (w.id === activeWeek.id
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-zinc-800 bg-zinc-800 text-zinc-200 hover:bg-zinc-700")
                }
                aria-pressed={w.id === activeWeek.id}
                aria-label={`Select ${w.title}`}
              >
                {w.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Week title/description */}
      <section className="mx-auto max-w-7xl px-6 pb-2 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">{activeWeek.title}</h2>
        <p className="mt-2 max-w-3xl text-zinc-300">{activeWeek.description}</p>
      </section>

      {/* Weekly snapshot tile */}
      <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-8">
        <ThisWeek
          season={season}
          leagueKey={leagueKeyParam ?? undefined}
          week={activeWeek.id === "preseason" ? 0 : Number(activeWeek.id.replace("week", ""))}
        />
      </section>

      {/* Weekly notes tile */}
      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
        <WeeklyNotes
          season={season}
          leagueKey={leagueKeyParam ?? undefined}
          week={activeWeek.id === "preseason" ? 0 : Number(activeWeek.id.replace("week", ""))}
        />
      </section>

      {/* Inner tabs */}
      <section className="mx-auto max-w-7xl px-6 pb-10 lg:px-8">
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-3 shadow-2xl ring-1 ring-black/10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(["powerRankings", "stealsOverpays", "strengthOfSchedule"] as InsightTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={
                  "px-5 py-2 text-sm font-medium rounded-lg transition " +
                  (activeTab === t
                    ? "bg-red-600 text-white"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800")
                }
                aria-pressed={activeTab === t}
              >
                {t === "powerRankings"
                  ? "Power Rankings"
                  : t === "stealsOverpays"
                  ? "Steals & Overpays"
                  : "Strength of Schedule"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {activeTab === "powerRankings" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">League Power Rankings</h3>
              {activeWeek.content.powerRankings.length > 0 ? (
                activeWeek.content.powerRankings.map((t) => (
                  <article
                    key={t.rank}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl hover:shadow-2xl hover:shadow-red-900/20 transition"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h4 className="text-xl font-semibold text-white">
                        #{t.rank} {t.team}
                      </h4>
                      <div className="flex items-center gap-1">
                        {t.players?.map((p, i) => (
                          <img
                            key={`${p.name}-${i}`}
                            src={p.image}
                            alt={p.name}
                            title={p.name}
                            className="h-8 w-8 rounded-full border border-zinc-800 object-cover"
                            onError={(ev) => {
                              const el = ev.currentTarget as HTMLImageElement;
                              el.style.display = "none";
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-zinc-300">{t.analysis}</p>
                    {t.likelihood && (
                      <p className="mt-2 text-sm text-zinc-400 italic">
                        <span className="font-medium">Championship odds:</span> {t.likelihood}
                      </p>
                    )}
                  </article>
                ))
              ) : (
                <p className="text-zinc-400">Power Rankings not yet available for this week.</p>
              )}
            </div>
          )}

          {activeTab === "stealsOverpays" && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white">Draft Steals &amp; Overpays</h3>

              {/* Steals */}
              <section className="rounded-2xl border border-emerald-900/60 bg-emerald-950/40 p-6">
                <h4 className="mb-4 text-lg font-semibold text-emerald-300">Top Steals 💰</h4>
                {activeWeek.content.stealsOverpays.steals.length > 0 ? (
                  <ul className="space-y-3">
                    {activeWeek.content.stealsOverpays.steals.map((s, i) => (
                      <li
                        key={`${s.player}-${i}`}
                        className="rounded-xl border border-emerald-900 bg-zinc-950/60 p-4"
                      >
                        <div className="mb-1 flex items-center gap-3">
                          <img
                            src={s.image}
                            alt={s.player}
                            title={s.player}
                            className="h-10 w-10 rounded-full border border-emerald-800 object-cover"
                            onError={(ev) => {
                              const el = ev.currentTarget as HTMLImageElement;
                              el.style.display = "none";
                            }}
                          />
                          <p className="font-semibold text-emerald-200">
                            {s.player} ({s.cost}) — {s.team}
                          </p>
                        </div>
                        <p className="text-sm text-zinc-300">{s.reason}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-400">No steals recorded for this week.</p>
                )}
              </section>

              {/* Overpays */}
              <section className="rounded-2xl border border-red-900/60 bg-red-950/40 p-6">
                <h4 className="mb-4 text-lg font-semibold text-red-300">Top Overpays 💸</h4>
                {activeWeek.content.stealsOverpays.overpays.length > 0 ? (
                  <ul className="space-y-3">
                    {activeWeek.content.stealsOverpays.overpays.map((o, i) => (
                      <li
                        key={`${o.player}-${i}`}
                        className="rounded-xl border border-red-900 bg-zinc-950/60 p-4"
                      >
                        <div className="mb-1 flex items-center gap-3">
                          <img
                            src={o.image}
                            alt={o.player}
                            title={o.player}
                            className="h-10 w-10 rounded-full border border-red-800 object-cover"
                            onError={(ev) => {
                              const el = ev.currentTarget as HTMLImageElement;
                              el.style.display = "none";
                            }}
                          />
                          <p className="font-semibold text-red-200">
                            {o.player} ({o.cost}) — {o.team}
                          </p>
                        </div>
                        <p className="text-sm text-zinc-300">{o.reason}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-400">No overpays recorded for this week.</p>
                )}
              </section>
            </div>
          )}

          {activeTab === "strengthOfSchedule" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Strength of Schedule</h3>
              {activeWeek.content.strengthOfSchedule.length > 0 ? (
                activeWeek.content.strengthOfSchedule.map((s) => (
                  <article
                    key={s.team}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
                  >
                    <h4 className="text-xl font-semibold text-white">{s.team}</h4>
                    <p className="mt-1 text-zinc-300">
                      <span className="font-medium">SoS Grade:</span>{" "}
                      <span className="font-bold text-emerald-300">{s.grade}</span>
                    </p>
                    {s.biggestGame && (
                      <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                        <p className="font-semibold text-purple-300">
                          🔥 Biggest Game: {s.biggestGame.week} vs. {s.biggestGame.opponent}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">{s.biggestGame.narrative}</p>
                      </div>
                    )}
                    <p className="mt-2 text-zinc-300">{s.analysis}</p>
                  </article>
                ))
              ) : (
                <p className="text-zinc-400">Strength of Schedule not yet available for this week.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
