"use client";

import { useMemo, useState } from "react";
import { weeks2025 } from "@/lib/season2025";

type SeasonOption = { value: string; label: string; available: boolean };

const seasons: SeasonOption[] = [
  { value: "2025", label: "2025", available: true },
  // Add more seasons here as you wire Yahoo history:
  { value: "2024", label: "2024", available: false },
  { value: "2023", label: "2023", available: false },
];

export default function HistoryPage() {
  const [season, setSeason] = useState<string>("2025");

  const preseason = useMemo(() => {
    if (season !== "2025") return null;
    return weeks2025.find((w) => w.id === "preseason") ?? null;
  }, [season]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <p className="text-sm uppercase tracking-widest text-red-400">League Archives</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              History
            </h1>
            <div className="flex items-center gap-2">
              <label htmlFor="season" className="text-sm text-zinc-300">
                Season
              </label>
              <select
                id="season"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                {seasons.map((s) => (
                  <option key={s.value} value={s.value} disabled={!s.available}>
                    {s.label} {s.available ? "" : "— (coming soon)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-300">
            Browse preseason narratives, draft steals & overpays, and early strength-of-schedule notes for past seasons.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        {season !== "2025" ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
            Historical data for {season} will appear here once Yahoo history is connected.
          </div>
        ) : !preseason ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
            No preseason content found for 2025.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Power Rankings snapshot */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
              <h2 className="text-lg font-bold text-white">Preseason Power Top 10</h2>
              <ol className="mt-3 space-y-2 text-sm text-zinc-200">
                {preseason.content.powerRankings.slice(0, 10).map((t) => (
                  <li key={t.rank} className="flex items-center justify-between">
                    <span>
                      #{t.rank} <span className="font-semibold">{t.team}</span>
                    </span>
                    {t.likelihood && (
                      <span className="text-xs text-zinc-400">{t.likelihood}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            {/* Draft Steals */}
            <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/40 p-6 shadow-2xl ring-1 ring-black/10">
              <h2 className="text-lg font-bold text-emerald-300">Draft Steals (Top 5)</h2>
              <ul className="mt-3 space-y-3 text-sm text-emerald-100">
                {preseason.content.stealsOverpays.steals.slice(0, 5).map((s, i) => (
                  <li key={`${s.player}-${i}`} className="flex items-start gap-3">
                    <img
                      src={s.image}
                      alt={s.player}
                      className="h-10 w-10 rounded-full border border-emerald-800 object-cover"
                      onError={(ev) => {
                        const el = ev.currentTarget as HTMLImageElement;
                        el.style.display = "none";
                      }}
                    />
                    <div>
                      <p className="font-semibold">
                        {s.player} ({s.cost}) — {s.team}
                      </p>
                      <p className="text-zinc-300">{s.reason}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Overpays */}
            <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-6 shadow-2xl ring-1 ring-black/10">
              <h2 className="text-lg font-bold text-red-300">Draft Overpays (Top 5)</h2>
              <ul className="mt-3 space-y-3 text-sm text-red-100">
                {preseason.content.stealsOverpays.overpays.slice(0, 5).map((o, i) => (
                  <li key={`${o.player}-${i}`} className="flex items-start gap-3">
                    <img
                      src={o.image}
                      alt={o.player}
                      className="h-10 w-10 rounded-full border border-red-800 object-cover"
                      onError={(ev) => {
                        const el = ev.currentTarget as HTMLImageElement;
                        el.style.display = "none";
                      }}
                    />
                    <div>
                      <p className="font-semibold">
                        {o.player} ({o.cost}) — {o.team}
                      </p>
                      <p className="text-zinc-300">{o.reason}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* SoS grid */}
            <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
              <h2 className="text-lg font-bold text-white">Strength of Schedule Highlights</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {preseason.content.strengthOfSchedule.map((s) => (
                  <div key={s.team} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="font-semibold text-zinc-100">{s.team}</p>
                    <p className="text-zinc-300">
                      Grade: <span className="font-bold text-emerald-300">{s.grade}</span>
                    </p>
                    {s.biggestGame && (
                      <p className="text-sm text-zinc-400">
                        🔥 {s.biggestGame.week} vs {s.biggestGame.opponent}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
