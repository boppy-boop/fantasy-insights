// lib/yahoo.ts
// Typed helpers + fetchers for your Yahoo (stub) endpoints.
// Strict TS, no `any`, no DOM types in exports.

/* ---------- Types (mirror your API shapes) ---------- */

export type TeamStanding = {
  teamKey: string;
  teamName: string;
  manager: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  streak?: string; // e.g. "W3", "L1"
  rank: number;    // 1 = best seed
};

export type StandingsResponse = {
  season: string;
  leagueKey: string;
  standings: TeamStanding[];
};

export type Side = {
  teamKey: string;
  teamName: string;
  score: number;
};

export type Matchup = {
  week: number;      // 0 = preseason, 1..17 = regular season
  home: Side;
  away: Side;
  isPlayoffs?: boolean;
};

export type MatchupsResponse = {
  season: string;
  leagueKey: string;
  matchups: Matchup[];
};

/* ---------- Fetchers ---------- */

export async function fetchStandings(params: {
  season?: string;
  leagueKey?: string;
  signal?: AbortSignal;
}): Promise<StandingsResponse> {
  const season = params.season ?? "2025";
  const leagueKey = params.leagueKey ?? "nfl.l.777777";
  const qs = new URLSearchParams({ season, leagueKey }).toString();

  const res = await fetch(`/api/yahoo/standings?${qs}`, {
    cache: "no-store",
    signal: params.signal,
  });
  if (!res.ok) throw new Error(`Standings HTTP ${res.status}`);

  return (await res.json()) as StandingsResponse;
}

export async function fetchMatchups(params: {
  season?: string;
  leagueKey?: string;
  week?: number;
  signal?: AbortSignal;
}): Promise<MatchupsResponse> {
  const season = params.season ?? "2025";
  const leagueKey = params.leagueKey ?? "nfl.l.777777";
  const search = new URLSearchParams({ season, leagueKey });
  if (typeof params.week === "number") search.set("week", String(params.week));

  const res = await fetch(`/api/yahoo/matchups?${search.toString()}`, {
    cache: "no-store",
    signal: params.signal,
  });
  if (!res.ok) throw new Error(`Matchups HTTP ${res.status}`);

  return (await res.json()) as MatchupsResponse;
}

/* ---------- Small helpers ---------- */

export function rankOf(teamKey: string, standings: TeamStanding[]): number | null {
  const found = standings.find((s) => s.teamKey === teamKey);
  return found ? found.rank : null;
}

export function margin(m: Matchup): number {
  return Math.abs(m.home.score - m.away.score);
}

export function winner(m: Matchup): Side | null {
  if (m.home.score === m.away.score) return null;
  return m.home.score > m.away.score ? m.home : m.away;
}

export function loser(m: Matchup): Side | null {
  if (m.home.score === m.away.score) return null;
  return m.home.score > m.away.score ? m.away : m.home;
}

/* ---------- Weekly insights (ToW, blowout, upsets) ---------- */

export type WeeklyInsights = {
  teamOfWeek?: { teamKey: string; teamName: string; score: number } | null;
  blowout?: { matchup: Matchup; margin: number } | null;
  upsets: Array<{
    matchup: Matchup;
    winnerSeed: number | null;
    loserSeed: number | null;
    margin: number;
  }>;
};

export function computeWeeklyInsights(
  matchups: Matchup[],
  standings: TeamStanding[]
): WeeklyInsights {
  if (matchups.length === 0) {
    return { teamOfWeek: null, blowout: null, upsets: [] };
  }

  // Team of the Week (highest single score)
  let best: { teamKey: string; teamName: string; score: number } | null = null;
  for (const m of matchups) {
    const sides: Side[] = [m.home, m.away];
    for (const s of sides) {
      if (best === null || s.score > best.score) {
        best = { teamKey: s.teamKey, teamName: s.teamName, score: s.score };
      }
    }
  }

  // Blowout (largest margin)
  let biggest: { matchup: Matchup; margin: number } | null = null;
  for (const m of matchups) {
    const mar = margin(m);
    if (biggest === null || mar > biggest.margin) {
      biggest = { matchup: m, margin: mar };
    }
  }

  // Upsets: winner has worse seed (higher rank number) than loser
  const upsets: WeeklyInsights["upsets"] = [];
  for (const m of matchups) {
    const w = winner(m);
    const l = loser(m);
    if (!w || !l) continue;

    const wSeed = rankOf(w.teamKey, standings);
    const lSeed = rankOf(l.teamKey, standings);

    if (wSeed !== null && lSeed !== null && wSeed > lSeed) {
      upsets.push({ matchup: m, winnerSeed: wSeed, loserSeed: lSeed, margin: margin(m) });
    }
  }

  return { teamOfWeek: best, blowout: biggest, upsets };
}
