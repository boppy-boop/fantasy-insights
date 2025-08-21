import NextAuth, { type AuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";
import type { JWT } from "next-auth/jwt";
import type { Account, Session } from "next-auth";

// Yahoo OpenID profile
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
      refresh_token: refreshed.refresh_token ?? token.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (refreshed.expires_in ?? 3600),
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
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
      // Keep minimal to avoid invalid_scope; once you enable them in the Yahoo app,
      // set YAHOO_SCOPE to "openid email profile fspt-r" in Vercel and redeploy.
      scope: process.env.YAHOO_SCOPE ?? "openid",
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

  // Yahoo signs ID tokens with ES256
  client: {
    token_endpoint_auth_method: "client_secret_basic",
    id_token_signed_response_alg: "ES256",
    authorization_signed_response_alg: "ES256",
  },

  checks: ["pkce", "state", "nonce"],

  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name || profile.nickname || "Yahoo User",
      email: profile.email,
      image: profile.picture,
    };
  },
};

export const authOptions: AuthOptions = {
  providers: [yahooProvider],
  session: { strategy: "jwt" },
  debug: true,
  callbacks: {
    async jwt({ token, account }) {
      const t = token as YahooToken;

      // First sign-in: store tokens
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

      // If token still valid, keep it
      if (t.expires_at && Date.now() / 1000 < t.expires_at) return t;

      // Otherwise refresh
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
