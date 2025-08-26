import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/yahoo/users
 * Returns the Yahoo "use_login" user payload for the signed-in account.
 * Requires a valid Yahoo access token in the session (set by NextAuth).
 */
export async function GET() {
  // Get the session via NextAuth v5 helper
  const session = await auth();

  // Pull the Yahoo access token we attached in the session callback
  const yahoo = (session as { yahoo?: { accessToken: string | null } } | null)?.yahoo;
  const accessToken = yahoo?.accessToken ?? null;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Not authenticated with Yahoo" },
      { status: 401 }
    );
  }

  const url =
    "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1?format=json";

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      // Always fetch fresh user info
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
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
