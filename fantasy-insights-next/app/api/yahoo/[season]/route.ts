// app/api/yahoo/[season]/route.ts
import { NextRequest } from "next/server";

export interface YahooLeague {
  leagueKey: string;
  name: string;
}

export type SeasonLeaguesResponse = { leagues: YahooLeague[] };

/**
 * Returns leagues for a given season (typed, no `any`).
 * Placeholder returns an empty list; your UI handles this gracefully.
 */
export async function GET(
  _req: NextRequest,
  context: { params: { season: string } }
): Promise<Response> {
  const { season } = context.params;

  // TODO: Wire to Yahoo API to fetch real leagues for `season`
  const payload: SeasonLeaguesResponse = {
    leagues: [],
    // Example mock if needed:
    // leagues: [{ leagueKey: `${season}.l.12345`, name: "Example League" }],
  };

  return Response.json(payload, { status: 200 });
}
