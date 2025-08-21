import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// Example endpoint; adjust as needed
const url =
  "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json";

export async function GET() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.access_token;

  if (!token) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "content-type": r.headers.get("content-type") ?? "text/plain" },
  });
}
