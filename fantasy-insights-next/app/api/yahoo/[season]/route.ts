// app/api/yahoo/[season]/route.ts

export interface YahooLeague {
  leagueKey: string;
  name: string;
}

export type SeasonLeaguesResponse = { leagues: YahooLeague[] };

/**
 * Returns leagues for a given season.
 * Placeholder returns an empty list (typed, no `any`, no unused vars).
 */
export async function GET(): Promise<Response> {
  const payload: SeasonLeaguesResponse = {
    leagues: [],
  };
  return Response.json(payload, { status: 200 });
}
