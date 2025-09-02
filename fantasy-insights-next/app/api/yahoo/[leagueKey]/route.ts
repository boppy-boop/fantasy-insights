import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/yahoo/[leagueKey]
 * Fetch Yahoo Fantasy League metadata for a specific leagueKey.
 *
 * Yahoo endpoint:
 *   /fantasy/v2/league/{league_key}?format=json
 *
 * Notes:
 * - leagueKey usually looks like "nfl.l.<leagueId>" (e.g., "nfl.l.123456").
 * - We return the raw Yahoo response as `data: unknown` since the shape can vary.
 */
export async function GET(
  _req: Request,
  context: { params: { leagueKey: string } }
) {
  const leagueKey = context.params.leagueKey?.trim();
  const session = await auth();
  const yahoo = (session as { yahoo?: { accessToken: string | null } } | null)?.yahoo;
  const accessToken = yahoo?.accessToken ?? null;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated with Yahoo" }, { status: 401 });
  }

  if (!leagueKey) {
    return NextResponse.json(
      { error: "Missing leagueKey (expected path like /api/yahoo/nfl.l.123456)" },
      { status: 400 }
    );
  }

  const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${encodeURIComponent(
    leagueKey
  )}?format=json`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "Yahoo API error", status: res.status, body },
        { status: 502 }
      );
    }

    const data: unknown = await res.json();

    return NextResponse.json(
      {
        ok: true,
        leagueKey,
        data,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
