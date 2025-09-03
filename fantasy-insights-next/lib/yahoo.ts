// lib/yahoo.ts
// Compatibility shim to keep pages compiling/running.
// Replace internals with real Yahoo API calls later, but keep shapes the same.

// ---------- Types ----------
export type YahooLeague = {
  leagueKey: string;
  name: string;
  season: number;
  numTeams?: number;
};

export type TeamStanding = {
  teamKey: string;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  rank: number;
};

export type MatchupTeam = {
  teamKey: string;
  teamName: string;
  points: number;
  projected?: number;
};

export type Matchup = {
  week: number;
  leagueKey: string;
  teams: MatchupTeam[];
};

export type LeagueMeta = {
  leagueKey: string;
  season: number;
  name: string;
  scoringType: 'head' | 'points' | 'roto' | 'other';
  startWeek: number;
  currentWeek: number;
  endWeek: number;
  numTeams: number;
};

// ---------- Stub data helpers ----------
const sampleTeams = (leagueKey: string) => [
  { teamKey: `${leagueKey}.t.1`, teamName: 'Team A' },
  { teamKey: `${leagueKey}.t.2`, teamName: 'Team B' },
  { teamKey: `${leagueKey}.t.3`, teamName: 'Team C' },
  { teamKey: `${leagueKey}.t.4`, teamName: 'Team D' },
];

function seededRand(seed: string) {
  let x = 0;
  for (let i = 0; i < seed.length; i++) x = (x * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    // simple LCG-ish
    x = (1103515245 * x + 12345) >>> 0;
    return (x % 10000) / 10000;
  };
}

// ---------- API: Seasons ----------
export async function fetchSeasons(): Promise<number[]> {
  // Return recent seasons; adjust as needed
  return [2025, 2024, 2023];
}

// ---------- API: Leagues by season ----------
export async function fetchLeaguesBySeason(season: number): Promise<YahooLeague[]> {
  // Stub two leagues per season
  return [
    { leagueKey: `${season}.l.1001`, name: `RGFL ${season}`, season, numTeams: 12 },
    { leagueKey: `${season}.l.2002`, name: `Friends League ${season}`, season, numTeams: 10 },
  ];
}

// ---------- API: League meta ----------
export async function fetchLeagueMeta(leagueKey: string): Promise<LeagueMeta> {
  const season = Number(leagueKey.split('.')[0]) || 2025;
  return {
    leagueKey,
    season,
    name: `League ${leagueKey}`,
    scoringType: 'head',
    startWeek: 1,
    currentWeek: 1,
    endWeek: 17,
    numTeams: sampleTeams(leagueKey).length,
  };
}

// ---------- API: Standings ----------
export async function fetchStandings(leagueKey: string): Promise<TeamStanding[]> {
  const teams = sampleTeams(leagueKey);
  const rnd = seededRand(`${leagueKey}-standings`);
  const withStats = teams.map((t, i) => {
    const wins = Math.floor(rnd() * 10);
    const losses = Math.floor(rnd() * 10);
    const ties = Math.floor(rnd() * 2);
    const pointsFor = Math.round((80 + rnd() * 80) * 10) / 10;
    const pointsAgainst = Math.round((80 + rnd() * 80) * 10) / 10;
    return {
      teamKey: t.teamKey,
      teamName: t.teamName,
      wins,
      losses,
      ties,
      pointsFor,
      pointsAgainst,
      rank: i + 1,
    } as TeamStanding;
  });

  // Sort by wins desc, PF tiebreaker
  withStats.sort((a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor);
  // Re-number rank after sort
  withStats.forEach((t, idx) => (t.rank = idx + 1));

  return withStats;
}

// ---------- API: Matchups ----------
export async function fetchMatchups(leagueKey: string, week: number): Promise<Matchup[]> {
  const teams = sampleTeams(leagueKey);
  const rnd = seededRand(`${leagueKey}-w${week}`);

  // Pair teams in simple 1v2, 3v4 matchups
  const pairs: [typeof teams[number], typeof teams[number]][] = [];
  for (let i = 0; i < teams.length; i += 2) {
    if (teams[i + 1]) pairs.push([teams[i], teams[i + 1]]);
  }

  const matchups: Matchup[] = pairs.map(([a, b]) => {
    const aPts = Math.round((80 + rnd() * 80) * 10) / 10;
    const bPts = Math.round((80 + rnd() * 80) * 10) / 10;
    const aProj = Math.round((aPts + 5 + rnd() * 10) * 10) / 10;
    const bProj = Math.round((bPts + 5 + rnd() * 10) * 10) / 10;

    return {
      week,
      leagueKey,
      teams: [
        { teamKey: a.teamKey, teamName: a.teamName, points: aPts, projected: aProj },
        { teamKey: b.teamKey, teamName: b.teamName, points: bPts, projected: bProj },
      ],
    };
  });

  return matchups;
}

// ---------- Optional: default export for convenience ----------
const api = {
  fetchSeasons,
  fetchLeaguesBySeason,
  fetchStandings,
  fetchMatchups,
  fetchLeagueMeta,
};
export default api;
