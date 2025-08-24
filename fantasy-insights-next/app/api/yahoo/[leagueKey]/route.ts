// app/api/yahoo/standings/[leagueKey]/route.ts
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

/** ---------- Helpers ---------- */
function num(n: any, fallback = 0): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

/** ---------- GET /api/yahoo/standings/:leagueKey ---------- */
export async function GET(
  _req: Request,
  ctx: { params: { leagueKey: string } }
) {
  const session = await getSessionSafely();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = getYahooTokenFromSession(session);
  if (!token) return NextResponse.json({ error: "No Yahoo token" }, { status: 401 });

  const leagueKey = String(ctx.params?.leagueKey ?? "").trim();
  if (!leagueKey) return NextResponse.json({ standings: [] });

  // Yahoo standings endpoint
  const data = await yahooFetch(`/league/${leagueKey}/standings`, token);

  // We’ll extract into this normalized shape
  const standings: Array<{
    teamKey: string;
    teamName: string;
    rank: number;
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number;
  }> = [];

  try {
    // Typical shape:
    // fantasy_content.league[1].standings[0].teams -> { 0: { team: [...] }, 1: { team: [...] }, count: N }
    const leagueNode = data?.fantasy_content?.league;
    const standingsNode =
      (Array.isArray(leagueNode?.[1]?.standings)
        ? leagueNode?.[1]?.standings?.[0]
        : leagueNode?.[1]?.standings) ?? leagueNode?.standings;

    const teamsNode =
      (standingsNode?.teams && typeof standingsNode.teams === "object"
        ? standingsNode.teams
        : standingsNode?.[0]?.teams) ?? null;

    if (teamsNode && typeof teamsNode === "object") {
      for (const tv of Object.values(teamsNode) as any[]) {
        const tArr = tv?.team;
        if (!tArr) continue;

        // Meta
        const meta = Array.isArray(tArr) ? tArr[0] : tArr;
        const teamKey = String(meta?.team_key ?? meta?.key ?? "");
        const teamName =
          String(meta?.name ?? meta?.team_name ?? meta?.nickname ?? "").trim() || "Unknown Team";

        // Standings blob (wins/losses/ties, rank, PF/PA)
        const stNode =
          (Array.isArray(tArr) ? tArr.find((x: any) => x?.team_standings)?.team_standings : tArr?.team_standings) ??
          {};

        const outcomes = stNode?.outcomes || stNode?.outcome_totals || {};
        const wins = num(outcomes?.wins ?? stNode?.wins, 0);
        const losses = num(outcomes?.losses ?? stNode?.losses, 0);
        const ties = num(outcomes?.ties ?? stNode?.ties, 0);
        const rank = num(stNode?.rank, 999);

        // Points for/against are sometimes at stNode or nested stats; normalize best-effort
        const pointsFor =
          num(stNode?.points_for ?? stNode?.pointsfor ?? stNode?.points ?? stNode?.pf, 0);
        const pointsAgainst =
          num(stNode?.points_against ?? stNode?.pointsagainst ?? stNode?.pa, 0);

        standings.push({
          teamKey,
          teamName,
          rank,
          wins,
          losses,
          ties,
          pointsFor,
          pointsAgainst,
        });
      }
    }
  } catch {
    // swallow parse errors; return whatever we collected
  }

  // Sort by rank ascending
  standings.sort((a, b) => (a.rank || 999) - (b.rank || 999));

  return NextResponse.json({ standings });
}
