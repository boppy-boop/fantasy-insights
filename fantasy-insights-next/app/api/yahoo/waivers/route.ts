import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/yahoo/waivers?leagueKey=nfl.l.123456
 *
 * Returns recent transactions for the given league. The Yahoo "transactions"
 * feed includes waivers, adds, drops, trades, etc. Your client code can filter
 * down to waiver-type events to power Steals/Overpays.
 *
 * Yahoo endpoint used:
 *   /fantasy/v2/league/{league_key}/transactions?format=json
 *
 * Query params:
 *   - leagueKey (required): e.g. "nfl.l.123456"
 *
 * Notes:
 *   - We return the raw Yahoo payload as `data: unknown` because the shape can vary.
 *   - If you later want server-side filtering, we can add parsing helpers.
 */
export async function GET(req: Request) {
  const session = await auth();
  const yahoo = (session as { yahoo?: { accessToken: string | null } } | null)?.yahoo;
  const accessToken = yahoo?.accessToken ?? null;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated with Yahoo" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const leagueKey = searchParams.get("leagueKey")?.trim() ?? "";

  if (!leagueKey) {
    return NextResponse.json(
      { error: "Missing required query param: leagueKey (e.g., nfl.l.123456)" },
      { status: 400 }
    );
  }

  const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${encodeURIComponent(
    leagueKey
  )}/transactions?format=json`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "Yahoo API error (transactions)", status: res.status, body },
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
