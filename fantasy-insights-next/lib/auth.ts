// lib/auth.ts
import NextAuth from "next-auth";
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

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
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

      if (t.provider !== "yahoo" || !t.accessToken || !t.accessTokenExpires) return token;
      if (Date.now() < (t.accessTokenExpires - 30_000)) return token;
      if (!t.refreshToken) return token;

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
});

export async function getYahooAccessTokenFromServer(): Promise<string | null> {
  const session = await auth();
  const yahoo = (session as SessionWithYahoo | null)?.yahoo;
  if (!yahoo?.accessToken) return null;
  return yahoo.accessToken;
}
