// lib/auth.ts
import type { AuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";

type YahooProfile = {
  sub: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
};

function basicAuth(): string {
  const id = process.env.YAHOO_CLIENT_ID!;
  const secret = process.env.YAHOO_CLIENT_SECRET!;
  return Buffer.from(`${id}:${secret}`).toString("base64");
}

async function refreshAccessToken(token: any) {
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

    const refreshed = await res.json();

    if (!res.ok || !refreshed.access_token) throw refreshed;

    return {
      ...token,
      access_token: refreshed.access_token,
      expires_at: Math.floor(Date.now() / 1000) + (refreshed.expires_in ?? 3600),
      refresh_token: refreshed.refresh_token ?? token.refresh_token,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}

const yahooProvider: OAuthConfig<YahooProfile> = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",
  wellKnown: "https://api.login.yahoo.com/.well-known/openid-configuration",

  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      response_type: "code",
      // ⬇️ use env, so you can switch between "openid" and "openid fspt-r ..." in Vercel
      scope: process.env.YAHOO_SCOPE || "openid email profile",
      code_challenge_method: "S256",
      redirect_uri: process.env.YAHOO_REDIRECT_URI!,
    },
  },

  token: {
    url: "https://api.login.yahoo.com/oauth2/get_token",
    params: { redirect_uri: process.env.YAHOO_REDIRECT_URI! },
  },

  userinfo: { url: "https://api.login.yahoo.com/openid/v1/userinfo" },

  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,

  client: {
    token_endpoint_auth_method: "client_secret_basic",
    id_token_signed_response_alg: "ES256",
    authorization_signed_response_alg: "ES256",
  },

  checks: ["pkce", "state", "nonce"],

  profile(p) {
    return {
      id: p.sub,
      name: p.name || p.nickname || "Yahoo User",
      email: p.email,
      image: p.picture,
    };
  },
};

export const authOptions: AuthOptions = {
  providers: [yahooProvider],
  session: { strategy: "jwt" },
  debug: true,

  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: stash tokens from Yahoo
      if (account) {
        return {
          ...token,
          access_token: (account as any).access_token,
          refresh_token: (account as any).refresh_token ?? (token as any).refresh_token,
          expires_at:
            Math.floor(Date.now() / 1000) + ((account as any).expires_in ?? 3600),
        };
      }
      // Refresh if expired
      if ((token as any).expires_at && Date.now() / 1000 >= (token as any).expires_at) {
        return await refreshAccessToken(token);
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).accessToken = (token as any).access_token;
      return session;
    },
  },
};
