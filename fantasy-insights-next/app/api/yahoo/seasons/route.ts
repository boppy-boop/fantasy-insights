import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/yahoo/seasons
 * Returns all Yahoo Fantasy "games" for the signed-in user (across seasons).
 * You can filter client-side for NFL (game code "nfl") and pick seasons you need.
 *
 * Yahoo endpoint:
 *   /fantasy/v2/users;use_login=1/games?format=json
 */
export async function GET() {
  const session = await auth();
  const yahoo = (session as { yahoo?: { accessToken: string | null } } | null)?.yahoo;
  const accessToken = yahoo?.accessToken ?? null;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated with Yahoo" }, { status: 401 });
  }

  const url =
    "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games?format=json";

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

    // Unknown because Yahoo response can vary; keep strong typing elsewhere
    const data: unknown = await res.json();

    return NextResponse.json(
      {
        ok: true,
        // tip: client can filter where game.code === "nfl"
        data,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
