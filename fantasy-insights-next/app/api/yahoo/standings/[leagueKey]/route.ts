// app/api/yahoo/meta/[leagueKey]/route.ts
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

/** ---------- GET /api/yahoo/meta/:leagueKey ---------- */
export async function GET(
  _req: Request,
  ctx: { params: { leagueKey: string } }
) {
  const session = await getSessionSafely();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = getYahooTokenFromSession(session);
  if (!token) return NextResponse.json({ error: "No Yahoo token" }, { status: 401 });

  const leagueKey = String(ctx.params?.leagueKey ?? "").trim();
  if (!leagueKey) return NextResponse.json({ meta: { startWeek: 1, endWeek: 17, currentWeek: 0 } });

  let startWeek = 1;
  let endWeek = 17;
  let currentWeek = 0;

  // ---- 1) League settings: start_week / end_week
  try {
    const settings = await yahooFetch(`/league/${leagueKey}/settings`, token);

    // Typical shape:
    // fantasy_content.league[1].settings[0].start_week
    // fantasy_content.league[1].settings[0].end_week
    const leagueNode = settings?.fantasy_content?.league;
    const settingsNode =
      (Array.isArray(leagueNode?.[1]?.settings)
        ? leagueNode[1].settings[0]
        : leagueNode?.[1]?.settings?.[0]) ||
      (leagueNode?.[1]?.settings ?? leagueNode?.settings);

    // Defensive extraction
    const sw =
      Number(
        settingsNode?.start_week ??
          settingsNode?.[0]?.start_week ??
          leagueNode?.[1]?.start_week ??
          leagueNode?.start_week
      ) || 1;

    const ew =
      Number(
        settingsNode?.end_week ??
          settingsNode?.[0]?.end_week ??
          leagueNode?.[1]?.end_week ??
          leagueNode?.end_week
      ) || 17;

    if (Number.isFinite(sw) && sw > 0) startWeek = sw;
    if (Number.isFinite(ew) && ew >= startWeek) endWeek = ew;
  } catch {
    // keep defaults
  }

  // ---- 2) Scoreboard (no week param) to infer "currentWeek" when season is live
  try {
    const sb = await yahooFetch(`/league/${leagueKey}/scoreboard`, token);

    // Typical shapes observed:
    // league[1].scoreboard[0].week  OR  league[1].scoreboard.week  OR in the first matchup payload
    const leagueNode = sb?.fantasy_content?.league;

    let wk =
      Number(
        (Array.isArray(leagueNode?.[1]?.scoreboard)
          ? leagueNode?.[1]?.scoreboard?.[0]?.week
          : leagueNode?.[1]?.scoreboard?.week) ??
          leagueNode?.scoreboard?.week
      ) || 0;

    if (!wk || !Number.isFinite(wk)) {
      // Fallback: try to read from the first matchup
      const scoreboardNode =
        (Array.isArray(leagueNode?.[1]?.scoreboard)
          ? leagueNode[1].scoreboard
          : leagueNode?.[1]?.scoreboard) ?? leagueNode?.scoreboard;

      const matchupsNode =
        (Array.isArray(scoreboardNode)
          ? scoreboardNode[1]?.matchups
          : scoreboardNode?.matchups) ?? scoreboardNode?.[0]?.matchups;

      if (matchupsNode && typeof matchupsNode === "object") {
        for (const mv of Object.values(matchupsNode) as any[]) {
          const matchupArr = mv?.matchup;
          if (matchupArr) {
            const maybeWeek = Number(
              (Array.isArray(matchupArr) ? matchupArr[0]?.week : matchupArr?.week) ?? 0
            );
            if (maybeWeek > 0) {
              wk = maybeWeek;
              break;
            }
          }
        }
      }
    }

    if (Number.isFinite(wk) && wk >= startWeek && wk <= endWeek) {
      currentWeek = wk;
    } else {
      // If the league hasn't started or the API returns nothing yet, keep 0
      currentWeek = 0;
    }
  } catch {
    // keep currentWeek = 0
  }

  return NextResponse.json({
    meta: { startWeek, endWeek, currentWeek },
  });
}
