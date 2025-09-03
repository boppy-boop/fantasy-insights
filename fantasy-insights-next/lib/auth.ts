// lib/auth.ts
// Your Yahoo OAuth config + callbacks, with a small compatibility layer so this works on NextAuth v4 or v5.

import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";
import type { Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { Buffer } from "node:buffer";

type SessionWithYahoo = Session & {
  yahoo?: { accessToken: string | null; accessTokenExpires: number | null };
};

/** Yahoo OIDC userinfo shape (subset) */
type YahooProfile = {
  sub: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
};

const yahoo: OAuthConfig<YahooProfile> = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",
  checks: ["pkce", "state"],
  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      scope: "openid profile email",
      response_type: "code",
    },
  },
  token: "https://api.login.yahoo.com/oauth2/get_token",
  userinfo: "https://api.login.yahoo.com/openid/v1/userinfo",
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name || profile.nickname || "Yahoo User",
      email: profile.email ?? null,
      image: profile.picture ?? null,
    };
  },
};

// ---- Your original callbacks preserved, wrapped in a NextAuthOptions object ----
export const authOptions: NextAuthOptions = {
  providers: [yahoo],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({
      token,
      account,
    }: {
      token: JWT;
      account?: Account | null;
    }): Promise<JWT> {
      type AppJWT = JWT & {
        provider?: "yahoo";
        accessToken?: string | null;
        accessTokenExpires?: number | null;
        refreshToken?: string | null;
      };

      const t = token as AppJWT;

      // On initial sign-in
      if (account?.provider === "yahoo") {
        const acc = account as Account & {
          expires_in?: number;
          expires_at?: number;
          access_token?: string;
          refresh_token?: string;
        };

        t.provider = "yahoo";
        t.accessToken = acc.access_token ?? null;
        t.refreshToken = acc.refresh_token ?? null;
        t.accessTokenExpires = acc.expires_at
          ? acc.expires_at * 1000
          : Date.now() + ((acc.expires_in ?? 3600) * 1000);
        return t;
      }

      // No Yahoo or no tokens tracked → bail
      if (t.provider !== "yahoo" || !t.accessToken || !t.accessTokenExpires) return token;

      // Not yet expired (30s early refresh buffer)
      if (Date.now() < (t.accessTokenExpires - 30_000)) return token;

      // No refresh token → cannot refresh
      if (!t.refreshToken) return token;

      // Try to refresh the Yahoo token
      try {
        const body = new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: t.refreshToken,
          client_id: process.env.YAHOO_CLIENT_ID || "",
          client_secret: process.env.YAHOO_CLIENT_SECRET || "",
          redirect_uri: process.env.NEXTAUTH_URL
            ? `${process.env.NEXTAUTH_URL}/api/auth/callback/yahoo`
            : "",
        });

        const res = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
          body,
        });

        if (!res.ok) throw new Error(`Yahoo refresh HTTP ${res.status}`);

        const json: {
          access_token: string;
          expires_in: number;
          refresh_token?: string;
        } = await res.json();

        t.accessToken = json.access_token;
        t.accessTokenExpires = Date.now() + json.expires_in * 1000;
        if (json.refresh_token) t.refreshToken = json.refresh_token;

        return t;
      } catch {
        // Hard fail → clear tokens (forces re-auth on next usage)
        t.accessToken = null;
        t.accessTokenExpires = null;
        return t;
      }
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      type AppJWT = JWT & {
        provider?: "yahoo";
        accessToken?: string | null;
        accessTokenExpires?: number | null;
      };
      const t = token as AppJWT;
      (session as unknown as { yahoo?: unknown }).yahoo = {
        provider: t.provider ?? null,
        accessToken: t.accessToken ?? null,
        accessTokenExpires: t.accessTokenExpires ?? null,
      };
      return session;
    },
  },
};

// ---- Compatibility layer: supports NextAuth v5 (object) and v4 (handler function) ----
const created = (NextAuth as unknown as (opts: NextAuthOptions) => any)(authOptions);

// v5 returns an object with handlers/auth/signIn/signOut
// v4 returns a single handler function; we adapt it so routes can always export GET/POST.
export const handlers: { GET: any; POST: any } =
  created && typeof created === "object" && "handlers" in created
    ? (created.handlers as { GET: any; POST: any })
    : { GET: created, POST: created };

// `auth` in v5; in v4 we provide a benign fallback that returns null (so logged-out homepage still renders)
export const auth: () => Promise<Session | null> =
  created && typeof created === "object" && "auth" in created
    ? (created.auth as () => Promise<Session | null>)
    : (async () => null);

// Optional helpers (exist in v5); in v4 these throw if called programmatically.
export const signIn =
  created && typeof created === "object" && "signIn" in created
    ? (created.signIn as (...args: any[]) => Promise<void>)
    : (async () => {
        throw new Error("signIn() is not available in this NextAuth version.");
      });

export const signOut =
  created && typeof created === "object" && "signOut" in created
    ? (created.signOut as (...args: any[]) => Promise<void>)
    : (async () => {
        throw new Error("signOut() is not available in this NextAuth version.");
      });

// ---- Helper you already use elsewhere ----
export async function getYahooAccessTokenFromServer(): Promise<string | null> {
  const session = await auth();
  const yahoo = (session as SessionWithYahoo | null)?.yahoo;
  if (!yahoo?.accessToken) return null;
  return yahoo.accessToken;
}
