// lib/yahoo.ts

/** ---------- Shared Types ---------- */
export type YahooLeague = {
  leagueKey: string;
  name: string;
};

export type TeamStanding = {
  teamKey: string;
  teamName: string;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
};

export type MatchupTeam = {
  teamKey: string;
  teamName: string;
  score: number;
};

export type Matchup = {
  id?: string;
  week: number;
  home: MatchupTeam;
  away: MatchupTeam;
};

export type LeagueMeta = {
  startWeek: number;   // usually 1
  endWeek: number;     // e.g., 17
  currentWeek: number; // 0 when season hasn't started yet
};

/** ---------- Lightweight fetch wrapper ---------- */
async function getJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store" });
  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {}
    throw new Error(`${res.status} ${res.statusText} — ${detail.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

/** ---------- Public client helpers ---------- */

/** Seasons available on Yahoo for the authed user (plus 2025 for preseason). */
export async function fetchSeasons(): Promise<string[]> {
  const data = await getJSON<{ seasons: string[] }>("/api/yahoo/seasons");
  return Array.isArray(data?.seasons) ? data.seasons : [];
}

/** Leagues for a given season (NFL only), discovered from the user's games. */
export async function fetchLeaguesBySeason(season: string): Promise<YahooLeague[]> {
  if (!season) return [];
  const data = await getJSON<{ leagues: YahooLeague[] }>(
    `/api/yahoo/leagues/${encodeURIComponent(season)}`
  );
  return Array.isArray(data?.leagues) ? data.leagues : [];
}

/** Normalized standings for a given league. */
export async function fetchStandings(opts: {
  season?: string;            // not required by the API route; useful for your state keys
  leagueKey: string;
  signal?: AbortSignal;
}): Promise<{ standings: TeamStanding[] }> {
  if (!opts.leagueKey) return { standings: [] };
  const data = await getJSON<{ standings: TeamStanding[] }>(
    `/api/yahoo/standings/${encodeURIComponent(opts.leagueKey)}`,
    { signal: opts.signal }
  );
  return { standings: Array.isArray(data?.standings) ? data.standings : [] };
}

/** League meta (startWeek/endWeek/currentWeek) for gating UI and hiding future weeks. */
export async function fetchLeagueMeta(opts: {
  leagueKey: string;
  signal?: AbortSignal;
}): Promise<LeagueMeta> {
  if (!opts.leagueKey) return { startWeek: 1, endWeek: 17, currentWeek: 0 };
  const data = await getJSON<{ meta: LeagueMeta }>(
    `/api/yahoo/meta/${encodeURIComponent(opts.leagueKey)}`,
    { signal: opts.signal }
  );
  return {
    startWeek: data?.meta?.startWeek ?? 1,
    endWeek: data?.meta?.endWeek ?? 17,
    currentWeek: data?.meta?.currentWeek ?? 0,
  };
}

/** Matchups for a specific week in a league. */
export async function fetchMatchups(opts: {
  leagueKey: string;
  week: number;
  signal?: AbortSignal;
}): Promise<{ week: number; matchups: Matchup[] }> {
  if (!opts.leagueKey || !opts.week) return { week: opts.week ?? 0, matchups: [] };
  const data = await getJSON<{ week: number; matchups: Matchup[] }>(
    `/api/yahoo/matchups/${encodeURIComponent(opts.leagueKey)}/${encodeURIComponent(
      String(opts.week)
    )}`,
    { signal: opts.signal }
  );
  return {
    week: Number(data?.week ?? opts.week ?? 0),
    matchups: Array.isArray(data?.matchups) ? data.matchups : [],
  };
}
