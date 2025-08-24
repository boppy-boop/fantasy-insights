// app/api/yahoo/standings/[leagueKey]/route.ts

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
 * Returns season-long standings for a league (typed, no `any`, no unused vars).
 * Placeholder returns an empty list; UI shows "No teams found."
 */
export async function GET(): Promise<Response> {
  const payload: StandingsResponse = { standings: [] };
  return Response.json(payload, { status: 200 });
}
