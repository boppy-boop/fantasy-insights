import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/yahoo/standings/[leagueKey]
 * Returns overall season standings for the given league.
 *
 * Yahoo endpoint:
 *   /fantasy/v2/league/{league_key}/standings?format=json
 *
 * Notes:
 * - `leagueKey` typically looks like "nfl.l.123456".
 * - Response shape can vary; we return it as `data: unknown`.
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
      { error: "Missing leagueKey (expected path like /api/yahoo/standings/nfl.l.123456)" },
      { status: 400 }
    );
  }

  const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${encodeURIComponent(
    leagueKey
  )}/standings?format=json`;

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
