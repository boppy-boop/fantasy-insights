import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.access_token;

  if (!token) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  const r = await fetch("https://api.login.yahoo.com/openid/v1/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Return JSON if possible, else raw text for easier debugging
  const text = await r.text();
  try {
    const json = JSON.parse(text);
    return NextResponse.json(json, { status: r.status });
  } catch {
    return new NextResponse(text, {
      status: r.status,
      headers: { "content-type": r.headers.get("content-type") ?? "text/plain" },
    });
  }
}
