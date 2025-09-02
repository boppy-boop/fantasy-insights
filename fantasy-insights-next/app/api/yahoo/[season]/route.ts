import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/yahoo/[season]
 * Returns Yahoo Fantasy "games" for the signed-in user for a specific season.
 *
 * Yahoo endpoint used:
 *   /fantasy/v2/users;use_login=1/games;seasons={season}?format=json
 *
 * Notes:
 * - The raw Yahoo response shape varies; we return it as `data: unknown`.
 * - Client code can further filter by game code (e.g., "nfl") and follow-up
 *   with additional calls (e.g., leagues, teams, matchups) using the game_key.
 */
export async function GET(
  _req: Request,
  context: { params: { season: string } }
) {
  const season = context.params.season;
  const session = await auth();
  const yahoo = (session as { yahoo?: { accessToken: string | null } } | null)?.yahoo;
  const accessToken = yahoo?.accessToken ?? null;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated with Yahoo" }, { status: 401 });
  }

  if (!season || !/^\d{4}$/.test(season)) {
    return NextResponse.json(
      { error: "Invalid or missing season. Expected a 4-digit year (e.g., 2024)." },
      { status: 400 }
    );
  }

  const url = `https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;seasons=${encodeURIComponent(
    season
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
        season,
        data,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
