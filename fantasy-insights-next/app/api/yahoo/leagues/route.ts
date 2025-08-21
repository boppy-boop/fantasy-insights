import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

/** Minimal, type-safe shape for the Fantasy API payload (no `any`). */
type YahooFantasyResponse = {
  [key: string]: unknown; // top-level is dynamic, keep it unknown not any
};

type YahooJWT = JWT & {
  access_token?: string;
};

export async function GET(req: NextRequest) {
  const jwt = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as YahooJWT | null;

  if (!jwt || typeof jwt.access_token !== "string") {
    return NextResponse.json(
      { error: "Not authenticated (no access token in session)." },
      { status: 401 }
    );
  }

  // Yahoo Fantasy example endpoint (requires fspt-r scope)
  const url =
    "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json";

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt.access_token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      {
        error: "Yahoo Fantasy API request failed.",
        status: res.status,
        details: text,
      },
      { status: res.status }
    );
  }

  const data = (await res.json()) as YahooFantasyResponse;
  return NextResponse.json(data, { status: 200 });
}
