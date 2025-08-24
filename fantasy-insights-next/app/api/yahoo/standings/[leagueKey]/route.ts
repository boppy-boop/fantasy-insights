// app/api/yahoo/standings/[leagueKey]/route.ts
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

export type StandingsResponse = { standings: TeamStanding[] };

/**
 * Returns season-long standings for a league (typed, no `any`).
 * Placeholder returns an empty list; UI shows "No teams found."
 */
export async function GET(
  _req: NextRequest,
  context: { params: { leagueKey: string } }
): Promise<Response> {
  const _leagueKey = context.params.leagueKey;

  const payload: StandingsResponse = { standings: [] };

  return Response.json(payload, { status: 200 });
}
