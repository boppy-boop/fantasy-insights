// app/api/yahoo/standings/[leagueKey]/[week]/route.ts

export interface TeamStanding {
  teamKey: string;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor?: number;
  pointsAgainst?: number;
}

export interface MatchSide {
  teamKey: string;
  teamName: string;
  score: number;
}

export interface Matchup {
  id?: string;
  home: MatchSide;
  away: MatchSide;
}

export type WeeklyResponse = {
  standings: TeamStanding[];
  matchups: Matchup[];
};

/**
 * Weekly standings + matchups for a league.
 * Note: No request/context args (avoids Next.js 15 second-arg typing issue).
 */
export async function GET(): Promise<Response> {
  const payload: WeeklyResponse = { standings: [], matchups: [] };
  return Response.json(payload, { status: 200 });
}
