// app/api/yahoo/matchups/[leagueKey]/[week]/route.ts
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

function num(n: any, fallback = 0): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

export const dynamic = "force-dynamic";

/** Types this route returns */
export type MatchupTeam = {
  teamKey: string;
  teamName: string;
  score: number;
};
export type Matchup = {
  id?: string;
  week: number;
  home: MatchupTeam;
  away: MatchupTeam;
};

/** ---------- GET /api/yahoo/matchups/:leagueKey/:week ---------- */
export async function GET(
  _req: Request,
  ctx: { params: { leagueKey: string; week: string } }
) {
  const session = await getSessionSafely();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = getYahooTokenFromSession(session);
  if (!token) return NextResponse.json({ error: "No Yahoo token" }, { status: 401 });

  const leagueKey = String(ctx.params?.leagueKey ?? "").trim();
  const week = num(ctx.params?.week, 0);

  if (!leagueKey || !week) {
    return NextResponse.json({ week, matchups: [] });
  }

  // Yahoo scoreboard for a specific week
  const data = await yahooFetch(`/league/${leagueKey}/scoreboard;week=${encodeURIComponent(week)}`, token);

  const matchups: Matchup[] = [];

  try {
    // Typical shape:
    // fantasy_content.league[1].scoreboard[0].matchups -> { 0: { matchup: [...] }, 1: {...}, count: N }
    const leagueNode = data?.fantasy_content?.league;
    const scoreboardNode =
      (Array.isArray(leagueNode?.[1]?.scoreboard)
        ? leagueNode?.[1]?.scoreboard?.[0]
        : leagueNode?.[1]?.scoreboard) ?? leagueNode?.scoreboard;

    const matchupsNode =
      (scoreboardNode?.matchups && typeof scoreboardNode.matchups === "object"
        ? scoreboardNode.matchups
        : scoreboardNode?.[1]?.matchups) ?? null;

    if (matchupsNode && typeof matchupsNode === "object") {
      for (const mv of Object.values(matchupsNode) as any[]) {
        const mArr = mv?.matchup;
        if (!mArr) continue;

        const meta = Array.isArray(mArr) ? mArr[0] : mArr;

        // matchup id/key try
        const matchupId =
          String(meta?.matchup_id ?? meta?.matchup_key ?? meta?.id ?? meta?.key ?? "") || undefined;

        // teams container
        const teamsNode =
          (Array.isArray(mArr) ? mArr.find((x: any) => x?.teams)?.teams : mArr?.teams) ??
          meta?.teams;

        let home: MatchupTeam | null = null;
        let away: MatchupTeam | null = null;

        if (teamsNode && typeof teamsNode === "object") {
          // Expect 2 teams per matchup
          const teamEntries = Object.values(teamsNode) as any[];
          for (const tv of teamEntries) {
            const tArr = tv?.team;
            if (!tArr) continue;

            const tMeta = Array.isArray(tArr) ? tArr[0] : tArr;
            const teamKey = String(tMeta?.team_key ?? tMeta?.key ?? "");
            const teamName =
              String(tMeta?.name ?? tMeta?.team_name ?? tMeta?.nickname ?? "").trim() || "Unknown Team";

            // team_points for score
            const pointsNode =
              (Array.isArray(tArr) ? tArr.find((x: any) => x?.team_points)?.team_points : tArr?.team_points) ??
              {};

            const total = num(pointsNode?.total ?? pointsNode?.points ?? pointsNode?.value, 0);

            const side = String(tv?.is_home ?? tMeta?.is_home ?? "").toLowerCase();
            const payload: MatchupTeam = { teamKey, teamName, score: total };

            if (side === "1" || side === "true" || side === "yes" || side === "home") {
              home = payload;
            } else if (!away) {
              // assume the other entry is away
              away = payload;
            } else {
              // if both filled oddly, prefer leaving first set and skip
            }
          }
        }

        // If we couldn't reliably tag home/away, just assign in order
        if (!home || !away) {
          const teamEntries = Object.values(teamsNode ?? {}) as any[];
          const t1 = teamEntries?.[0]?.team;
          const t2 = teamEntries?.[1]?.team;

          const normalize = (tObj: any): MatchupTeam | null => {
            if (!tObj) return null;
            const tMeta = Array.isArray(tObj) ? tObj[0] : tObj;
            const teamKey = String(tMeta?.team_key ?? tMeta?.key ?? "");
            const teamName =
              String(tMeta?.name ?? tMeta?.team_name ?? tMeta?.nickname ?? "").trim() || "Unknown Team";
            const pointsNode =
              (Array.isArray(tObj) ? tObj.find((x: any) => x?.team_points)?.team_points : tObj?.team_points) ??
              {};
            const total = num(pointsNode?.total ?? pointsNode?.points ?? pointsNode?.value, 0);
            return { teamKey, teamName, score: total };
          };

          home = home ?? normalize(t1);
          away = away ?? normalize(t2);
        }

        if (home && away) {
          matchups.push({
            id: matchupId,
            week,
            home,
            away,
          });
        }
      }
    }
  } catch {
    // swallow parse issues; return what we have
  }

  return NextResponse.json({ week, matchups });
}
