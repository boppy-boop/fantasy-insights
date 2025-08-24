// app/api/yahoo/[leagueKey]/[week]/route.ts

export type WeekMetaResponse = { ok: true };

/**
 * Placeholder route for league/week meta.
 * Note: No request/context args (avoids Next.js 15 second-arg typing issue).
 */
export async function GET(): Promise<Response> {
  const payload: WeekMetaResponse = { ok: true };
  return Response.json(payload, { status: 200 });
}
