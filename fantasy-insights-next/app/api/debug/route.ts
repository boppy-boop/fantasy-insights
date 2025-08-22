// app/api/debug/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  // If next-auth is configured, you'll see user info; otherwise null.
  let authed = false;
  let user: { name?: string | null; email?: string | null } | null = null;

  try {
    const session = await getServerSession();
    if (session?.user) {
      authed = true;
      user = { name: session.user.name ?? null, email: session.user.email ?? null };
    }
  } catch {
    // swallow — debug endpoint should never crash
  }

  return NextResponse.json(
    {
      ok: true,
      authed,
      user,
      env: {
        node: process.version,
        nextRuntime: "edge/serverless-compatible",
      }
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
