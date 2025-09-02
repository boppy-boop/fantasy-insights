import { NextResponse } from "next/server";
import { getYahooAccessTokenFromServer } from "@/lib/auth";

/**
 * GET /api/yahoo/[leagueKey]/[week]
 * Returns the Yahoo Fantasy scoreboard (matchups) for a specific league + week.
 *
 * Yahoo endpoint:
 *   /fantasy/v2/league/{league_key}/scoreboard;week={WEEK}?format=json
 *
 * Notes:
 * - leagueKey typically looks like "nfl.l.123456".
 * - week must be a positive integer (Yahoo will return playoffs as well if applicable).
 * - We return the raw Yahoo response as `data: unknown`.
 */
export async function GET(
  _req: Request,
  { params }: { params: Record<string, string | string[]> }
) {
  const leagueKey = String(params.leagueKey ?? "").trim();
  const weekParam = String(params.week ?? "").trim();

  // Validate input
  if (!leagueKey) {
    return NextResponse.json(
      { error: "Missing leagueKey (expected path like /api/yahoo/nfl.l.123456/1)" },
      { status: 400 }
    );
  }
  if (!/^\d+$/.test(weekParam)) {
    return NextResponse.json(
      { error: "Invalid week. Expected a positive integer (e.g., 1, 2, ...)." },
      { status: 400 }
    );
  }

  const week = Number(weekParam);

  try {
    // Acquire Yahoo access token from server-side session
    const accessToken = await getYahooAccessTokenFromServer();
    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated with Yahoo. Please sign in." },
        { status: 401 }
      );
    }

    // Call Yahoo Fantasy Sports API
    const yahooUrl = `https://fantasysports.yahooapis.com/fantasy/v2/league/${encodeURIComponent(
      leagueKey
    )}/scoreboard;week=${encodeURIComponent(String(week))}?format=json`;

    const res = await fetch(yahooUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      // Don’t cache league-week scoreboard at build time
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Yahoo API error: HTTP ${res.status}` },
        { status: res.status }
      );
    }

    const data: unknown = await res.json();

    return NextResponse.json(
      {
        ok: true,
        leagueKey,
        week,
        data,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
