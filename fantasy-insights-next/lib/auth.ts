// lib/auth.ts
// NextAuth config for Yahoo (OIDC) with JWT token persistence & refresh.
// Exports: { handlers, auth, signIn, signOut } for the App Router.

import NextAuth from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";
import type { Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { Buffer } from "node:buffer";

/** Yahoo OIDC userinfo shape (subset) */
type YahooProfile = {
  sub: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
};

/** Define Yahoo as a typed OAuth provider config */
const yahoo: OAuthConfig<YahooProfile> = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",
  wellKnown: "https://api.login.yahoo.com/.well-known/openid-configuration",
  clientId: process.env.YAHOO_CLIENT_ID ?? "",
  clientSecret: process.env.YAHOO_CLIENT_SECRET ?? "",
  authorization: {
    params: {
      scope: "openid profile email fspt-r",
    },
  },
  profile(profile: YahooProfile) {
    return {
      id: profile.sub ?? "",
      name: profile.name || profile.nickname || null,
      email: profile.email ?? null,
      image: profile.picture ?? null,
    };
  },
};

/** What we store in the JWT */
type AppJWT = {
  sub?: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;

  accessToken?: string | null;
  refreshToken?: string | null;
  accessTokenExpires?: number | null; // epoch ms
  provider?: "yahoo";
};

/** Response shape from Yahoo token endpoint when refreshing */
type YahooRefreshResponse = {
  access_token: string;
  token_type?: string;
  expires_in: number; // seconds
  refresh_token?: string;
};

/** Refresh Yahoo access token using the refresh token */
async function refreshYahooAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  accessTokenExpires: number; // epoch ms
  refreshToken?: string;
}> {
  const clientId = process.env.YAHOO_CLIENT_ID ?? "";
  const clientSecret = process.env.YAHOO_CLIENT_SECRET ?? "";
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const form = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Yahoo refresh failed: ${res.status} ${text}`);
  }

  const json = (await res.json()) as YahooRefreshResponse;
  const now = Date.now();

  return {
    accessToken: json.access_token,
    accessTokenExpires: now + (json.expires_in ?? 3600) * 1000,
    refreshToken: json.refresh_token,
  };
}

/** NextAuth v5-style export (no NextAuthConfig import needed) */
export const {
  handlers, // { GET, POST } for /api/auth/[...nextauth]
  auth,     // server helper for RSC/RouteHandlers
  signIn,
  signOut,
} = NextAuth({
  providers: [yahoo],
  // If needed on Vercel, set env vars instead of typed field:
  // AUTH_TRUST_HOST=true
  // NEXTAUTH_URL=https://fantasy-insights-next.vercel.app
  session: { strategy: "jwt" },

  callbacks: {
    /** Persist oauth tokens on initial sign-in, and refresh when expired */
    async jwt({
      token,
      account,
    }: {
      token: JWT;
      account?: Account | null;
    }) {
      const t = token as AppJWT;

      // Initial sign-in with Yahoo provider
      if (account?.provider === "yahoo") {
        const expiresAtSeconds =
          (account as { expires_at?: number }).expires_at ??
          (typeof account.expires_in === "number"
            ? Math.floor(Date.now() / 1000) + account.expires_in
            : Math.floor(Date.now() / 1000) + 3600);

        t.provider = "yahoo";
        t.accessToken = account.access_token ?? null;
        t.refreshToken = account.refresh_token ?? null;
        t.accessTokenExpires = expiresAtSeconds * 1000; // ms
        return t;
      }

      // No tokens to manage
      if (!t.accessToken || !t.accessTokenExpires || !t.refreshToken) return t;

      // Still valid?
      if (Date.now() < (t.accessTokenExpires ?? 0)) return t;

      // Expired — refresh
      try {
        const refreshed = await refreshYahooAccessToken(t.refreshToken);
        t.accessToken = refreshed.accessToken;
        t.accessTokenExpires = refreshed.accessTokenExpires;
        if (refreshed.refreshToken) t.refreshToken = refreshed.refreshToken;
        return t;
      } catch {
        // Hard failure — clear access; UI can prompt re-auth
        t.accessToken = null;
        t.accessTokenExpires = null;
        return t;
      }
    },

    /** Expose minimal auth info to the client (no refresh token) */
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      const t = token as AppJWT;
      (session as unknown as { yahoo?: unknown }).yahoo = {
        provider: t.provider ?? null,
        accessToken: t.accessToken ?? null,
        accessTokenExpires: t.accessTokenExpires ?? null,
      };
      return session;
    },
  },
});

/** ---------- Server-side helper: get a fresh Yahoo access token ---------- */
export async function getYahooAccessTokenFromServer(): Promise<string | null> {
  const session = await auth();
  const yahoo = (session as any)?.yahoo as
    | { accessToken: string | null; accessTokenExpires: number | null }
    | undefined;

  if (!yahoo?.accessToken) return null;
  return yahoo.accessToken;
}
