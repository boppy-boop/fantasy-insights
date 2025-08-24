// app/api/yahoo/standings/[leagueKey]/[week]/route.ts
import { NextRequest } from "next/server";

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
 * Placeholder returns empty arrays (no `any`, no unused vars).
 */
export async function GET(
  _req: NextRequest,
  _context: { params: { leagueKey: string; week: string } }
): Promise<Response> {
  const payload: WeeklyResponse = { standings: [], matchups: [] };
  return Response.json(payload, { status: 200 });
}
