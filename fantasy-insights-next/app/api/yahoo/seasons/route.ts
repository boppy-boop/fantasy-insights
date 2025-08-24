// app/api/yahoo/seasons/route.ts
import { NextResponse } from "next/server";

/** ---------- Session helpers (compatible with NextAuth v4/v5) ---------- */
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

/** ---------- GET /api/yahoo/seasons ---------- */
export async function GET() {
  const session = await getSessionSafely();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = getYahooTokenFromSession(session);
  if (!token) {
    return NextResponse.json({ error: "No Yahoo token" }, { status: 401 });
  }

  // Get all games for the logged-in Yahoo user; we'll filter to NFL and collect seasons.
  const data = await yahooFetch(`/users;use_login=1/games`, token);

  const seasons = new Set<string>();

  try {
    // Shape (typical):
    // fantasy_content.users[0].user[1].games -> { 0: { game: [...] }, 1: { game: [...] }, count: N }
    const usersNode = data?.fantasy_content?.users;
    // Grab first user container defensively
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

        if (code === "nfl" && seasonStr) {
          seasons.add(seasonStr);
        }
      }
    }
  } catch {
    // swallow parse issues; we’ll return whatever we found
  }

  // Ensure 2025 is present so your UI still works in preseason before Yahoo data exists.
  seasons.add("2025");

  const out = Array.from(seasons).sort((a, b) => Number(b) - Number(a));
  return NextResponse.json({ seasons: out });
}
