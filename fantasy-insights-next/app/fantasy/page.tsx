"use client";

import { useEffect, useState } from "react";

type LeagueSummary = {
  leagueKey: string;
  name: string;
  season: string;
};

export default function Page() {
  const [leagues, setLeagues] = useState<LeagueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/yahoo/leagues", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { leagues?: LeagueSummary[] };
        if (!cancelled) {
          setLeagues(Array.isArray(data?.leagues) ? data.leagues : []);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load leagues");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true; // avoid setState after unmount
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">2025 Season</h1>
          <p className="text-sm text-neutral-600">
            Live league overview, auto-generated storylines, and weekly insights.
          </p>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Headlines & Insights */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight">This Week’s Storylines</h2>
            <p className="mt-2 text-sm text-neutral-600">
              We’ll generate notes from live data (records, streaks, points for/against, and injuries).
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-neutral-800">
              <li>Power surge: Top-3 scoring teams trending up 2 weeks straight.</li>
              <li>Upset alert: A bottom-half team projects as a slight favorite.</li>
              <li>Injury watch: Roster volatility flagged for two contenders.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight">Live Matchups</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Hook to Yahoo matchups endpoint and summarize with your rules/AI.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-xs uppercase tracking-widest text-neutral-500">Matchup</p>
                <p className="font-semibold">Team A vs Team B</p>
                <p className="text-sm text-neutral-600">Projected: 127.4 – 121.9</p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-xs uppercase tracking-widest text-neutral-500">Matchup</p>
                <p className="font-semibold">Team C vs Team D</p>
                <p className="text-sm text-neutral-600">Projected: 118.3 – 116.2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Leagues list */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight">Your Yahoo Leagues</h2>
            {loading && <p className="mt-2 text-sm text-neutral-600">Loading…</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {!loading && !error && (
              <ul className="mt-2 divide-y">
                {leagues.map((l) => (
                  <li key={l.leagueKey} className="py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{l.name}</p>
                        <p className="text-xs text-neutral-600">Season {l.season}</p>
                      </div>
                      <button className="rounded-lg border border-neutral-200 px-3 py-1 text-xs font-semibold">
                        Open
                      </button>
                    </div>
                  </li>
                ))}
                {leagues.length === 0 && (
                  <li className="py-2 text-sm text-neutral-600">No leagues found yet.</li>
                )}
              </ul>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
