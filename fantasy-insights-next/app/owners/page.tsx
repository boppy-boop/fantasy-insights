// app/owners/page.tsx
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
  type YahooLeague,
  type TeamStanding,
} from "../../lib/yahoo";

// ---------- helpers (no any) ----------

function getManagerName(team: unknown): string | undefined {
  if (typeof team !== "object" || team === null) return undefined;
  const t = team as Record<string, unknown>;

  // team.manager?.{name|nickname}
  const manager = t["manager"];
  if (manager && typeof manager === "object") {
    const m = manager as Record<string, unknown>;
    const byName =
      (typeof m["name"] === "string" && (m["name"] as string)) ||
      (typeof m["nickname"] === "string" && (m["nickname"] as string));
    if (byName) return byName;
  }

  // team.managers?.[0]?.{name|nickname}
  const managers = t["managers"];
  if (Array.isArray(managers) && managers.length > 0) {
    const m = managers[0];
    if (typeof m === "object" && m !== null) {
      const r = m as Record<string, unknown>;
      const byName =
        (typeof r["name"] === "string" && (r["name"] as string)) ||
        (typeof r["nickname"] === "string" && (r["nickname"] as string));
      if (byName) return byName;
    }
  }

  // team.owner?.{name|nickname}
  const owner = t["owner"];
  if (owner && typeof owner === "object") {
    const o = owner as Record<string, unknown>;
    const byName =
      (typeof o["name"] === "string" && (o["name"] as string)) ||
      (typeof o["nickname"] === "string" && (o["nickname"] as string));
    if (byName) return byName;
  }

  return undefined;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

// ---------- page ----------

export default function OwnersPage() {
  const { data: session, status } = useSession();
  const search = useSearchParams();
  const router = useRouter();

  // URL state
  const initialSeason = search.get("season") ?? "2025";
  const initialLeagueKey = search.get("leagueKey") ?? "";

  const [season, setSeason] = useState<string>(initialSeason);
  const [leagueKey, setLeagueKey] = useState<string>(initialLeagueKey);

  // Lists
  const [seasons, setSeasons] = useState<string[]>(["2025"]);
  const [leagues, setLeagues] = useState<YahooLeague[]>([]);
  const [teams, setTeams] = useState<TeamStanding[]>([]);

  // UI state
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const [errorLeagues, setErrorLeagues] = useState<string | null>(null);
  const [errorTeams, setErrorTeams] = useState<string | null>(null);

  // keep URL in sync (no week on this page)
  useEffect(() => {
    const q = new URLSearchParams();
    if (season) q.set("season", season);
    if (leagueKey) q.set("leagueKey", leagueKey);
    router.replace(`/owners?${q.toString()}`);
  }, [season, leagueKey, router]);

  // seasons
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoadingSeasons(true);
        const s = await fetchSeasons();
        if (!live) return;
        const merged = Array.from(new Set(["2025", ...s])).sort(
          (a, b) => Number(b) - Number(a)
        );
        setSeasons(merged);
        if (!merged.includes(season)) setSeason(merged[0] ?? "2025");
      } finally {
        if (live) setLoadingSeasons(false);
      }
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // leagues (requires auth)
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setErrorLeagues(null);
        setLoadingLeagues(true);
        setLeagues([]);
        setTeams([]);

        if (status !== "authenticated") return;

        const ls = await fetchLeaguesBySeason(season);
        if (!live) return;

        setLeagues(ls);
        if (!ls.find((l) => l.leagueKey === leagueKey)) {
          setLeagueKey(ls[0]?.leagueKey ?? "");
        }
      } catch (e) {
        if (!live) return;
        setErrorLeagues(
          e instanceof Error ? e.message : "Failed to load leagues"
        );
      } finally {
        if (live) setLoadingLeagues(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [season, status, leagueKey]);

  // teams for league
  useEffect(() => {
    let live = true;
    const ac = new AbortController();
    (async () => {
      if (!leagueKey || status !== "authenticated") {
        setTeams([]);
        return;
      }
      try {
        setErrorTeams(null);
        setLoadingTeams(true);

        // standings endpoint gives us the team list reliably
        const { standings } = await fetchStandings({
          leagueKey,
          season,
          signal: ac.signal,
        });

        if (!live) return;
        setTeams(standings);
      } catch (e) {
        if (!live) return;
        setErrorTeams(
          e instanceof Error ? e.message : "Failed to load teams/owners"
        );
      } finally {
        if (live) setLoadingTeams(false);
      }
    })();
    return () => {
      live = false;
      ac.abort();
    };
  }, [leagueKey, season, status]);

  const firstName = useMemo(() => {
    const raw = session?.user?.name ?? "";
    const f = raw.trim().split(/\s+/)[0];
    return f || "Manager";
  }, [session]);

  const showSignIn = status !== "authenticated";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-950">
      {/* header */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-red-400">
                League Directory
              </p>
              <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {showSignIn ? "Owners" : `Owners — hi, ${firstName}`}
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-300">
                Browse teams and managers for the selected league.
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

      {/* controls */}
      <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* season */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Season
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
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

          {/* league */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              League
            </label>
            <div className="mt-1 flex gap-2">
              <select
                value={leagueKey}
                onChange={(e) => setLeagueKey(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-red-600"
                disabled={loadingLeagues || leagues.length === 0 || showSignIn}
              >
                {leagues.length === 0 ? (
                  <option value="" disabled>
                    {showSignIn ? "Sign in to load leagues" : "No leagues found"}
                  </option>
                ) : (
                  leagues.map((l: YahooLeague) => (
                    <option key={l.leagueKey} value={l.leagueKey}>
                      {l.name}
                    </option>
                  ))
                )}
              </select>

              <Link
                href={`/fantasy?season=${encodeURIComponent(
                  season
                )}&leagueKey=${encodeURIComponent(leagueKey)}`}
                className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
              >
                Go to Dashboard
              </Link>
            </div>
            {errorLeagues && (
              <p className="mt-1 text-[11px] text-amber-400">{errorLeagues}</p>
            )}
          </div>
        </div>
      </section>

      {/* owners grid */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl ring-1 ring-black/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Teams & Owners</h2>
            <span className="text-xs uppercase tracking-wider text-zinc-400">
              {teams.length} teams
            </span>
          </div>

          {loadingTeams ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-800" />
              ))}
            </div>
          ) : errorTeams ? (
            <div className="rounded-lg border border-amber-900/60 bg-amber-950/40 p-3 text-amber-300">
              {errorTeams}
            </div>
          ) : teams.length === 0 ? (
            <p className="text-zinc-400">No teams found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((t: TeamStanding, idx: number) => {
                // only touch known fields; owner name via safe helper on the raw object
                const teamName = (t as unknown as { teamName?: string }).teamName ?? "Team";
                const ownerName = getManagerName(t) ?? "Manager";
                return (
                  <div
                    key={(t as unknown as { teamKey?: string }).teamKey ?? idx}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <PlayerHeadshot name={ownerName} size={40} rounded="lg" />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {teamName}
                        </p>
                        <p className="text-xs text-zinc-400">{ownerName}</p>
                      </div>
                    </div>
                    {/* optional link to team page later */}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
