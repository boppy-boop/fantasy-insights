// app/owners/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PlayerHeadshot from "@/components/PlayerHeadshot";

// Local clamp since "@/lib/utils" doesn't exist (yet)
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Keep types local to avoid cross-file coupling
type TeamStanding = {
  teamKey: string;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor?: number;
  pointsAgainst?: number;
};

type StandingsResponse = { standings: TeamStanding[] };

export default function OwnersPage() {
  const searchParams = useSearchParams();
  const leagueKey = searchParams.get("leagueKey") ?? undefined;

  const [teams, setTeams] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState<boolean>(!!leagueKey);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!leagueKey) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/yahoo/standings/${encodeURIComponent(leagueKey)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as StandingsResponse;
        if (!cancelled) setTeams(data.standings ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load owners");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [leagueKey]);

  const sorted = useMemo(() => {
    return [...teams].sort((a, b) => {
      // primary: wins desc; secondary: pointsFor desc; tertiary: teamName asc
      if (b.wins !== a.wins) return b.wins - a.wins;
      if ((b.pointsFor ?? 0) !== (a.pointsFor ?? 0)) return (b.pointsFor ?? 0) - (a.pointsFor ?? 0);
      return a.teamName.localeCompare(b.teamName);
    });
  }, [teams]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Owners</h1>
        <p className="mt-1 text-sm text-zinc-400">
          League managers, records, and quick profile cards.
        </p>
      </header>

      {!leagueKey && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <p className="text-sm text-zinc-300">
            No league selected. Add <code className="text-zinc-200">?leagueKey=YOUR_KEY</code> to
            the URL, or wire this page to your league selector to auto-populate.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-zinc-800" />
          ))}
        </div>
      ) : (
        leagueKey && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center text-sm text-zinc-400">
                No owners found for this league yet.
              </div>
            ) : (
              sorted.map((t) => <OwnerCard key={t.teamKey} team={t} />)
            )}
          </div>
        )
      )}
    </div>
  );
}

function OwnerCard({ team }: { team: TeamStanding }) {
  const games = team.wins + team.losses + team.ties;
  const winPct = games > 0 ? team.wins / games : 0;
  const widthPct = clamp(Math.round(winPct * 100), 0, 100);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl ring-1 ring-black/10">
      <div className="flex items-center gap-3">
        <PlayerHeadshot name={team.teamName} size={44} />
        <div>
          <p className="text-base font-semibold text-white">{team.teamName}</p>
          <p className="text-xs text-zinc-400">
            Record:{" "}
            <span className="text-zinc-200">
              {team.wins}-{team.losses}
              {team.ties ? `-${team.ties}` : ""}
            </span>
            {typeof team.pointsFor === "number" && (
              <>
                {" "}
                • PF: <span className="text-zinc-200">{team.pointsFor.toFixed(1)}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Win% bar */}
      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-zinc-800">
          <div
            className="h-2 rounded-full bg-emerald-500"
            style={{ width: `${widthPct}%` }}
            aria-label={`Win percentage ${widthPct}%`}
          />
        </div>
        <p className="mt-1 text-right text-xs text-zinc-400">{widthPct}% win rate</p>
      </div>
    </div>
  );
}
