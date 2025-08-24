// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";

export const runtime = "nodejs";

/** Shape of Yahoo's OIDC userinfo */
interface YahooProfile {
  sub?: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
}

/** Refresh Yahoo tokens safely (Node runtime only) */
async function refreshYahooToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number; refresh_token?: string } | null> {
  const clientId = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) return null;

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };

  return json;
}

/**
 * Yahoo provider as a plain object (no OAuthProvider() helper).
 * Typing it as OAuthConfig<YahooProfile> avoids helper/generic issues.
 */
const Yahoo: OAuthConfig<YahooProfile> = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",
  // OIDC discovery – Yahoo publishes authorization, token and userinfo here
  wellKnown: "https://api.login.yahoo.com/.well-known/openid-configuration",
  clientId: process.env.YAHOO_CLIENT_ID ?? "",
  clientSecret: process.env.YAHOO_CLIENT_SECRET ?? "",
  authorization: {
    params: {
      // Fantasy Sports read scope
      scope: "openid profile email fspt-r",
    },
  },
  // Explicit checks
  checks: ["pkce", "state"],
  profile(raw) {
    const p = raw as Partial<YahooProfile>;
    return {
      id: p.sub ?? "",
      name: p.name || p.nickname || null,
      email: p.email ?? null,
      image: p.picture ?? null,
    };
  },
};

type AugmentedJWT = JWT & {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // epoch ms
};

type AugmentedSession = Session & {
  accessToken?: string;
  expiresAt?: number;
};

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // NOTE: Do not export authOptions from this file. Route modules may only export route handlers & route options.
  providers: [Yahoo],
  callbacks: {
    async jwt({ token, account }) {
      const t = token as AugmentedJWT;

      // First sign-in: capture tokens from provider
      if (account) {
        const acc = account as unknown as {
          access_token?: string;
          refresh_token?: string;
          expires_in?: number;
        };

        if (acc.access_token) t.accessToken = acc.access_token;
        if (acc.refresh_token) t.refreshToken = acc.refresh_token;
        t.expiresAt = Date.now() + ((acc.expires_in ?? 3600) * 1000);
        return t;
      }

      // Still valid?
      if (t.expiresAt && Date.now() < t.expiresAt - 60_000) return t;

      // Refresh with Yahoo
      if (t.refreshToken) {
        const refreshed = await refreshYahooToken(t.refreshToken);
        if (refreshed?.access_token) {
          t.accessToken = refreshed.access_token;
          t.expiresAt = Date.now() + (refreshed.expires_in ?? 3600) * 1000;
          if (refreshed.refresh_token) t.refreshToken = refreshed.refresh_token;
          return t;
        }
      }

      // Give up: force re-auth next time
      delete t.accessToken;
      delete t.expiresAt;
      return t;
    },

    async session({ session, token }) {
      const t = token as AugmentedJWT;
      const s = session as AugmentedSession;
      s.accessToken = t.accessToken;
      s.expiresAt = t.expiresAt;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
