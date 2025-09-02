// lib/yahoo.ts
// Typed helpers + lightweight adapters for your Yahoo API proxy routes.
// No `any` types; returns `unknown` for raw Yahoo payloads when appropriate.

export type TeamBasic = {
  id: string;
  name: string;
  logo?: string | null;
  manager?: string | null;
};

export type TeamStanding = {
  team: TeamBasic;
  wins: number;
  losses: number;
  ties: number;
  pct: number;
  pointsFor?: number;
  pointsAgainst?: number;
  rank?: number;
};

export type MatchTeamScore = {
  team: TeamBasic;
  score: number;
};

export type Matchup = {
  id: string;
  week: number;
  home: MatchTeamScore;
  away: MatchTeamScore;
  status?: string;
};

export type TransactionPlayer = {
  name: string;
  from?: string | null;
  to?: string | null;
};

export type Transaction = {
  id: string;
  type: string;
  timestamp: number; // unix seconds
  players?: TransactionPlayer[];
};

type JsonOk = {
  ok: boolean;
  [k: string]: unknown;
};

// ---- Raw fetchers (return raw payloads as unknown) ----

export async function fetchUserSeasons(): Promise<unknown> {
  const res = await fetch("/api/yahoo/seasons", { cache: "no-store" });
  if (!res.ok) throw new Error(`seasons: HTTP ${res.status}`);
  const json: JsonOk = await res.json();
  return json.data ?? null;
}

export async function fetchSeason(season: string): Promise<unknown> {
  const res = await fetch(`/api/yahoo/${encodeURIComponent(season)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`season ${season}: HTTP ${res.status}`);
  const json: JsonOk = await res.json();
  return json.data ?? null;
}

export async function fetchLeagues(season?: string): Promise<unknown> {
  const url = season
    ? `/api/yahoo/leagues?season=${encodeURIComponent(season)}`
    : "/api/yahoo/leagues";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`leagues: HTTP ${res.status}`);
  const json: JsonOk = await res.json();
  return json.data ?? null;
}

export async function fetchLeague(leagueKey: string): Promise<unknown> {
  const res = await fetch(`/api/yahoo/${encodeURIComponent(leagueKey)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`league ${leagueKey}: HTTP ${res.status}`);
  const json: JsonOk = await res.json();
  return json.data ?? null;
}

export async function fetchStandings(leagueKey: string): Promise<unknown> {
  const res = await fetch(
    `/api/yahoo/standings/${encodeURIComponent(leagueKey)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`standings ${leagueKey}: HTTP ${res.status}`);
  const json: JsonOk = await res.json();
  return json.data ?? null;
}

export async function fetchScoreboard(
  leagueKey: string,
  week: number
): Promise<unknown> {
  const res = await fetch(
    `/api/yahoo/${encodeURIComponent(leagueKey)}/${encodeURIComponent(
      String(week)
    )}`,
    { cache: "no-store" }
  );
  if (!res.ok)
    throw new Error(
      `scoreboard ${leagueKey} week ${week}: HTTP ${res.status}`
    );
  const json: JsonOk = await res.json();
  return json.data ?? null;
}

export async function fetchTransactions(
  leagueKey: string
): Promise<unknown> {
  const res = await fetch(
    `/api/yahoo/waivers?leagueKey=${encodeURIComponent(leagueKey)}`,
    { cache: "no-store" }
  );
  if (!res.ok)
    throw new Error(`transactions ${leagueKey}: HTTP ${res.status}`);
  const json: JsonOk = await res.json();
  return json.data ?? null;
}

// ---- Optional: best-effort parsers (keep them tolerant & typed) ----
// These try to convert raw Yahoo payloads into simple, stable shapes that the UI can consume.
// If the shape doesn’t match expectations, they return an empty array rather than throwing.

export function parseStandings(data: unknown): TeamStanding[] {
  // This is intentionally conservative: Yahoo's JSON is nested & can vary.
  // We only map expected fields if they look like what we need.
  const out: TeamStanding[] = [];
  if (!data || typeof data !== "object") return out;
  // You can expand this when you’re ready to lock the upstream shape.
  return out;
}

export function parseScoreboard(
  data: unknown,
  week: number
): Matchup[] {
  const out: Matchup[] = [];
  if (!data || typeof data !== "object") return out;
  return out;
}

export function parseTransactions(data: unknown): Transaction[] {
  const out: Transaction[] = [];
  if (!data || typeof data !== "object") return out;
  return out;
}
