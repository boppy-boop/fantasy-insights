// app/api/yahoo/leagues/[season]/route.ts
import { NextResponse } from "next/server";

/** ---------- Session helpers (NextAuth v4/v5 safe) ---------- */
async function getSessionSafely(): Promise<any | null> {
  try {
    const { getServerSession } = await import("next-auth");
    try {
      const mod = await import("@/app/api/auth/[...nextauth]/route");
      const authOptions = (mod as any).authOptions;
      if (authOptions) return getServerSession(authOptions as any);
    } catch {
      return getServerSession();
    }
  } catch {
    // next-auth not configured
  }
  return null;
}

function getYahooTokenFromSession(session: any): string | null {
  return (
    session?.accessToken ||
    session?.user?.accessToken ||
    session?.token ||
    session?.yahooToken ||
    null
  );
}

/** ---------- Yahoo helpers ---------- */
const BASE = "https://fantasysports.yahooapis.com/fantasy/v2";

async function yahooFetch(path: string, token: string) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}format=json`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Yahoo ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

export const dynamic = "force-dynamic";

/** ---------- GET /api/yahoo/leagues/:season ---------- */
export async function GET(
  _req: Request,
  ctx: { params: { season: string } }
) {
  const session = await getSessionSafely();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = getYahooTokenFromSession(session);
  if (!token) return NextResponse.json({ error: "No Yahoo token" }, { status: 401 });

  const season = String(ctx.params?.season ?? "").trim();
  if (!season) return NextResponse.json({ leagues: [] });

  // 1) Discover the NFL game_key for this season from the user's games
  const gamesData = await yahooFetch(`/users;use_login=1/games`, token);

  let nflGameKey: string | null = null;
  try {
    // fantasy_content.users[0].user[1].games -> { 0: { game: [...] }, 1: { game: [...] }, count: N }
    const usersNode = gamesData?.fantasy_content?.users;
    let userContainer: any = null;
    if (Array.isArray(usersNode)) {
      userContainer = usersNode[0];
    } else if (usersNode && typeof usersNode === "object") {
      const vals = Object.values(usersNode);
      userContainer = vals.find((v: any) => v?.user) ?? vals[0];
    }

    const userArr = userContainer?.user;
    const gamesNode =
      (Array.isArray(userArr) ? userArr.find((x: any) => x?.games)?.games : userArr?.games) ??
      userArr?.[1]?.games;

    if (gamesNode && typeof gamesNode === "object") {
      for (const gv of Object.values(gamesNode) as any[]) {
        const gArr = gv?.game;
        if (!gArr) continue;

        const meta = Array.isArray(gArr) ? gArr[0] : gArr;
        const code = String(meta?.code ?? meta?.game_code ?? "").toLowerCase();
        const seasonStr = String(meta?.season ?? meta?.game_season ?? "");
        const gameKey = String(meta?.game_key ?? meta?.key ?? "");

        if (code === "nfl" && seasonStr === season && gameKey) {
          nflGameKey = gameKey;
          break;
        }
      }
    }
  } catch {
    // swallow; nflGameKey may remain null
  }

  if (!nflGameKey) {
    // If we can't find the game key (e.g., preseason and Yahoo hasn't opened it yet),
    // return empty list (UI handles gracefully).
    return NextResponse.json({ leagues: [] });
  }

  // 2) Fetch leagues for that NFL game_key
  const leaguesData = await yahooFetch(
    `/users;use_login=1/games;game_keys=${encodeURIComponent(nflGameKey)}/leagues`,
    token
  );

  const leagues: Array<{ leagueKey: string; name: string }> = [];
  try {
    // Shape:
    // fantasy_content.users[0].user[1].games[0].game[1].leagues -> { 0: { league: [...] }, ... }
    const usersNode = leaguesData?.fantasy_content?.users;
    let userContainer: any = null;
    if (Array.isArray(usersNode)) {
      userContainer = usersNode[0];
    } else if (usersNode && typeof usersNode === "object") {
      const vals = Object.values(usersNode);
      userContainer = vals.find((v: any) => v?.user) ?? vals[0];
    }

    const userArr = userContainer?.user;

    // Find the game object with leagues, similar to above
    let gamesNode: any =
      (Array.isArray(userArr) ? userArr.find((x: any) => x?.games)?.games : userArr?.games) ??
      userArr?.[1]?.games;

    // gamesNode can be object with numeric keys -> each has { game: [...] }
    if (gamesNode && typeof gamesNode === "object") {
      for (const gv of Object.values(gamesNode) as any[]) {
        const gArr = gv?.game;
        if (!gArr) continue;

        // Some structures: gArr[0] meta, gArr[1].leagues the container
        const leaguesNode =
          (Array.isArray(gArr) ? gArr.find((x: any) => x?.leagues)?.leagues : gArr?.leagues) ??
          gArr?.[1]?.leagues;

        if (leaguesNode && typeof leaguesNode === "object") {
          for (const lv of Object.values(leaguesNode) as any[]) {
            const lArr = lv?.league;
            if (!lArr) continue;

            const meta = Array.isArray(lArr) ? lArr[0] : lArr;
            const leagueKey = String(meta?.league_key ?? meta?.key ?? "");
            const name = String(meta?.name ?? meta?.league_name ?? "");

            if (leagueKey && name) leagues.push({ leagueKey, name });
          }
        }
      }
    }
  } catch {
    // swallow parse issues; return whatever we collected
  }

  return NextResponse.json({ leagues });
}
