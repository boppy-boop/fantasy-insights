import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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
  context: { params: { leagueKey: string; week: string } }
) {
  const leagueKey = context.params.leagueKey?.trim();
  const weekParam = context.params.week?.trim();

  const session = await auth();
  const yahoo = (session as { yahoo?: { accessToken: string | null } } | null)?.yahoo;
  const accessToken = yahoo?.accessToken ?? null;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated with Yahoo" }, { status: 401 });
  }

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

  const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${encodeURIComponent(
    leagueKey
  )}/scoreboard;week=${encodeURIComponent(String(week))}?format=json`;

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
