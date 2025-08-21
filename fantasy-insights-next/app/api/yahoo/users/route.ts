import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

/** Shape returned by Yahoo OpenID userinfo */
interface YahooUserInfo {
  sub: string;
  name?: string;
  nickname?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  locale?: string;
}

type YahooJWT = JWT & {
  access_token?: string;
};

export async function GET(req: NextRequest) {
  // Read the NextAuth JWT from cookies and pull the Yahoo access token we saved in callbacks
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

  const res = await fetch("https://api.login.yahoo.com/openid/v1/userinfo", {
    headers: { Authorization: `Bearer ${jwt.access_token}` },
    // Always fetch from the origin; do not cache
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Yahoo userinfo request failed.", status: res.status },
      { status: res.status }
    );
  }

  const data = (await res.json()) as YahooUserInfo;
  return NextResponse.json(data, { status: 200 });
}
