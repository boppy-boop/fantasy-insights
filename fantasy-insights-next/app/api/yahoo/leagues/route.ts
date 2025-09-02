import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/yahoo/leagues
 *
 * Returns the user's Yahoo Fantasy NFL leagues across seasons.
 * - If `?season=YYYY` is provided, returns only that season's NFL leagues.
 * - If omitted, it fetches ALL NFL game_keys visible to the user and returns leagues for all of them.
 *
 * Yahoo endpoints used:
 * 1) /fantasy/v2/users;use_login=1/games?format=json
 * 2) /fantasy/v2/users;use_login=1/games;game_keys={csv}/leagues?format=json
 *
 * We keep the Yahoo payload as `data: unknown` since schema varies by account and season.
 */

export async function GET(req: Request) {
  const session = await auth();
  const yahoo = (session as { yahoo?: { accessToken: string | null } } | null)?.yahoo;
  const accessToken = yahoo?.accessToken ?? null;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated with Yahoo" }, { status: 401 });
  }

  // Optional filter: /api/yahoo/leagues?season=2024
  const { searchParams } = new URL(req.url);
  const seasonFilter = searchParams.get("season");

  // 1) Fetch all games visible to the signed-in user
  const gamesUrl =
    "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games?format=json";

  const gamesRes = await fetch(gamesUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!gamesRes.ok) {
    const body = await gamesRes.text().catch(() => "");
    return NextResponse.json(
      { error: "Yahoo API error (games)", status: gamesRes.status, body },
      { status: 502 }
    );
  }

  // We’ll parse as text first so we can robustly extract nfl game_keys regardless of nested structure.
  const gamesText = await gamesRes.text();

  // Extract every occurrence of nfl.<year> from the payload (e.g., nfl.2024, nfl.2023)
  // This avoids depending on Yahoo's heavily nested array/object structure.
  const allKeys = Array.from(new Set((gamesText.match(/nfl\.\d{4}/g) ?? [])));

  // Optionally filter to one season if requested
  const gameKeys = seasonFilter
    ? allKeys.filter((k) => k === `nfl.${seasonFilter}`)
    : allKeys;

  // If we found no NFL game keys, return early with an empty result
  if (gameKeys.length === 0) {
    return NextResponse.json(
      {
        ok: true,
        gameKeys,
        data: null,
      },
      { status: 200 }
    );
  }

  // 2) Fetch leagues for those game keys
  const leaguesUrl = `https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=${encodeURIComponent(
    gameKeys.join(",")
  )}/leagues?format=json`;

  const leaguesRes = await fetch(leaguesUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!leaguesRes.ok) {
    const body = await leaguesRes.text().catch(() => "");
    return NextResponse.json(
      { error: "Yahoo API error (leagues)", status: leaguesRes.status, body },
      { status: 502 }
    );
  }

  const data: unknown = await leaguesRes.json();

  return NextResponse.json(
    {
      ok: true,
      gameKeys,
      data,
    },
    { status: 200 }
  );
}
