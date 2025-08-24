// app/api/yahoo/[leagueKey]/route.ts
import { NextRequest } from "next/server";

export interface LeagueMeta {
  startWeek: number;
  endWeek: number;
  currentWeek: number; // 0 = preseason
}

export type LeagueMetaResponse = LeagueMeta;

/**
 * Returns league meta (typed, no `any`).
 * Placeholder keeps site in preseason until you wire Yahoo data.
 */
export async function GET(
  _req: NextRequest,
  context: { params: { leagueKey: string } }
): Promise<Response> {
  const _leagueKey = context.params.leagueKey;

  const payload: LeagueMetaResponse = {
    startWeek: 1,
    endWeek: 17,
    currentWeek: 0,
  };

  return Response.json(payload, { status: 200 });
}
