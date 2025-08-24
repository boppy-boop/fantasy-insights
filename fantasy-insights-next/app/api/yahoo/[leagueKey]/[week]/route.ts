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
 * Returns weekly standings+matchups for a league (typed, no `any`).
 * Placeholder returns empty arrays; UI handles this gracefully.
 */
export async function GET(
  _req: NextRequest,
  context: { params: { leagueKey: string; week: string } }
): Promise<Response> {
  const _leagueKey = context.params.leagueKey;
  const _weekNum = Number(context.params.week) || 0;

  const payload: WeeklyResponse = { standings: [], matchups: [] };

  return Response.json(payload, { status: 200 });
}
