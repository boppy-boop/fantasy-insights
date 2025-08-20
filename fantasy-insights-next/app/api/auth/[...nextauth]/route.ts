export const runtime = "nodejs";

import NextAuth, { type AuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";
import type { JWT } from "next-auth/jwt";
import type { Session, Account } from "next-auth";

// ---- Types ----
type YahooProfile = {
  sub: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
};

type YahooToken = JWT & {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number; // epoch seconds
  error?: "RefreshAccessTokenError";
};

// ---- Helpers ----
function basicAuth(): string {
  const id = process.env.YAHOO_CLIENT_ID!;
  const secret = process.env.YAHOO_CLIENT_SECRET!;
  return Buffer.from(`${id}:${secret}`).toString("base64");
}

async function refreshAccessToken(token: YahooToken): Promise<YahooToken> {
  try {
    const res = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth()}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refresh_token ?? "",
      }),
    });

    const refreshed = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: unknown;
    };

    if (!res.ok || !refreshed.access_token) throw refreshed;

    return {
      ...token,
      access_token: refreshed.access_token,
      expires_at: Math.floor(Date.now() / 1000) + (refreshed.expires_in ?? 3600),
      refresh_token: refreshed.refresh_token ?? token.refresh_token,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

// ---- Yahoo Provider (typed) ----
const yahooProvider: OAuthConfig<YahooProfile> = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",
  checks: ["state"],

  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      response_type: "code",
      scope: "openid",               // keep minimal for now
      redirect_uri: process.env.YAHOO_REDIRECT_URI!,
    },
  },

  token: {
    url: "https://api.login.yahoo.com/oauth2/get_token",
    params: { redirect_uri: process.env.YAHOO_REDIRECT_URI! },
  },

  // ❌ REMOVE this line while using only `openid`
  // userinfo: { url: "https://api.login.yahoo.com/openid/v1/userinfo" },

  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,

  profile(profile) {
    // NextAuth will pass claims from the ID token as `profile`
    return {
      id: profile.sub,
      name: profile.name || profile.nickname || "Yahoo User",
      email: profile.email,
      image: profile.picture,
    };
  },
};

// ---- NextAuth config ----
const authOptions: AuthOptions = {
  providers: [yahooProvider], // <-- no `any`
  session: { strategy: "jwt" },
  debug: true,
  callbacks: {
    async jwt({ token, account }) {
      const t = token as YahooToken;

      if (account) {
        const acc = account as Account & {
          access_token?: string;
          refresh_token?: string;
          expires_in?: number;
        };
        if (acc.access_token) {
          return {
            ...t,
            access_token: acc.access_token,
            refresh_token: acc.refresh_token ?? t.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + (acc.expires_in ?? 3600),
          };
        }
      }

      if (t.expires_at && Date.now() / 1000 < t.expires_at) return t;

      return await refreshAccessToken(t);
    },

    async session({ session, token }) {
      (session as Session & { access_token?: string }).access_token = (token as YahooToken).access_token;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
