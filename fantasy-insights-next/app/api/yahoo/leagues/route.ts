// app/api/yahoo/leagues/route.ts
import { NextResponse } from "next/server";

type LeagueSummary = {
  leagueKey: string;
  name: string;
  season: string;
};

// disable caching in dev/preview so UI reflects changes immediately
export const dynamic = "force-dynamic";

const MOCK_LEAGUES: Record<string, LeagueSummary[]> = {
  "2025": [
    {
      leagueKey: "nfl.l.777777",
      name: "Rex Grossman Championship S League",
      season: "2025",
    },
  ],
  "2024": [
    {
      leagueKey: "nfl.l.777777",
      name: "Rex Grossman Championship S League",
      season: "2024",
    },
  ],
  "2023": [
    {
      leagueKey: "nfl.l.777777",
      name: "Rex Grossman Championship S League",
      season: "2023",
    },
  ],
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const seasonParam = url.searchParams.get("season");

  // normalize season (fallback to 2025)
  const season =
    seasonParam && /^\d{4}$/.test(seasonParam) ? seasonParam : "2025";

  const leagues = MOCK_LEAGUES[season] ?? [];

  return NextResponse.json(
    { leagues },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
