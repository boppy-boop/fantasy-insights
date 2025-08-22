"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchStandings, type StandingsResponse } from "@/lib/yahoo";

type SortKey = "seed" | "winPct" | "pointsFor" | "pointsAgainst" | "manager";

export default function OwnersPage() {
  const [season] = useState<string>("2025");
  const [leagueKey] = useState<string | undefined>(undefined); // wire your real key if needed
  const [data, setData] = useState<StandingsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("seed");
  const [descending, setDescending] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetchStandings({ season, leagueKey, signal: ac.signal });
        if (!active) return;
        setData(res);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load owners");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      ac.abort();
    };
  }, [season, leagueKey]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    let rows = data.standings.map((s) => {
      const games = s.wins + s.losses + s.ties;
      const winPct = games > 0 ? s.wins / games : 0;
      return { ...s, winPct };
    });
    if (needle.length > 0) {
      rows = rows.filter(
        (r) =>
          r.manager.toLowerCase().includes(needle) ||
          r.teamName.toLowerCase().includes(needle)
      );
    }
    rows.sort((a, b) => {
      const dir = descending ? -1 : 1;
      switch (sortKey) {
        case "seed":
          return (a.rank - b.rank) * dir;
        case "winPct":
          return (a.winPct - b.winPct) * dir;
        case "pointsFor":
          return (a.pointsFor - b.pointsFor) * dir;
        case "pointsAgainst":
          return (a.pointsAgainst - b.pointsAgainst) * dir;
        case "manager":
          return a.manager.localeCompare(b.manager) * dir;
        default:
          return 0;
      }
    });
    return rows;
  }, [data, q, sortKey, descending]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <p className="text-sm uppercase tracking-widest text-sky-400">League Directory</p>
          <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Owners & Teams
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-300">
            Find every manager at a glance. Sort by seed, win %, or points. Click through to the weekly dashboard.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/fantasy?season=2025"
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
            >
              2025 Dashboard
            </Link>
            <Link
              href="/records"
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
            >
              Records
            </Link>
            <Link
              href="/history"
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
            >
              History
            </Link>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl ring-1 ring-black/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-300" htmlFor="q">
                Search
              </label>
              <input
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Manager or team name"
                className="w-64 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-300" htmlFor="sort">
                Sort by
              </label>
              <select
                id="sort"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-700"
              >
                <option value="seed">Seed</option>
                <option value="winPct">Win %</option>
                <option value="pointsFor">Points For</option>
                <option value="pointsAgainst">Points Against</option>
                <option value="manager">Manager</option>
              </select>
              <button
                type="button"
                aria-label="Toggle sort direction"
                onClick={() => setDescending((d) => !d)}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
              >
                {descending ? "Desc" : "Asc"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-zinc-900" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
            Failed to load owners. {error}
          </div>
        ) : !data ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
            No owners available.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <article
                key={t.teamKey}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl ring-1 ring-black/10 transition hover:shadow-zinc-900/40"
              >
                {/* Glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-full bg-sky-700/10 blur-2xl transition group-hover:bg-sky-600/20" />
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-semibold text-zinc-300 ring-1 ring-white/10">
                    Seed #{t.rank}
                  </span>
                  {t.streak && (
                    <span
                      className={
                        "rounded-md px-2 py-0.5 text-xs font-semibold ring-1 " +
                        (t.streak.startsWith("W")
                          ? "bg-emerald-700/20 text-emerald-300 ring-emerald-700/40"
                          : "bg-red-700/20 text-red-300 ring-red-700/40")
                      }
                    >
                      {t.streak}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{t.teamName}</h3>
                <p className="text-sm text-zinc-400">{t.manager}</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                    <p className="text-zinc-400">Record</p>
                    <p className="font-medium text-zinc-100">
                      {t.wins}-{t.losses}
                      {t.ties ? `-${t.ties}` : ""}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                    <p className="text-zinc-400">Win %</p>
                    <p className="font-medium text-zinc-100">
                      {(((t.wins + 0.0001) / (t.wins + t.losses + t.ties || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                    <p className="text-zinc-400">PF</p>
                    <p className="font-medium text-zinc-100">{t.pointsFor.toFixed(1)}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                    <p className="text-zinc-400">PA</p>
                    <p className="font-medium text-zinc-100">{t.pointsAgainst.toFixed(1)}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/fantasy?season=${season}&week=week1`}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
                  >
                    View Week 1
                  </Link>
                  <Link
                    href={`/fantasy?season=${season}&week=preseason`}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
                  >
                    Preseason
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
