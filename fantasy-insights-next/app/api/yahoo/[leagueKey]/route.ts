// app/api/yahoo/[leagueKey]/route.ts

export interface LeagueMeta {
  startWeek: number;
  endWeek: number;
  currentWeek: number; // 0 = preseason
}

export type LeagueMetaResponse = LeagueMeta;

/**
 * Returns league meta (typed, no `any`, no unused vars).
 * Placeholder keeps site in preseason until you wire Yahoo data.
 */
export async function GET(): Promise<Response> {
  const payload: LeagueMetaResponse = {
    startWeek: 1,
    endWeek: 17,
    currentWeek: 0,
  };

  return Response.json(payload, { status: 200 });
}
