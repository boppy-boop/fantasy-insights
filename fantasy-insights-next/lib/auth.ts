// lib/auth.ts
import type { AuthOptions, Account, Session } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";
import type { JWT } from "next-auth/jwt";

// ---- Yahoo OpenID profile shape ----
export type YahooProfile = {
  sub: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
};

// ---- JWT we store in NextAuth ----
type AppToken = JWT & {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number; // epoch seconds
  error?: "RefreshAccessTokenError";
};

// ---- Token response from Yahoo ----
type YahooTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
};

// ---- Account shape we receive on initial sign-in ----
type YahooAccount = Account & {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

// ---- Helpers ----
function basicAuth(): string {
  const id = process.env.YAHOO_CLIENT_ID!;
  const secret = process.env.YAHOO_CLIENT_SECRET!;
  return Buffer.from(`${id}:${secret}`).toString("base64");
}

async function refreshAccessToken(token: AppToken): Promise<AppToken> {
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

    const refreshed: YahooTokenResponse = await res.json();

    if (!res.ok || !refreshed.access_token) {
      // If Yahoo includes an error string, preserve it in dev logs
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("Yahoo refresh failed", refreshed);
      }
      return { ...token, error: "RefreshAccessTokenError" };
    }

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

// ---- Yahoo Provider ----
const yahooProvider: OAuthConfig<YahooProfile> = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",

  // Use discovery
  wellKnown: "https://api.login.yahoo.com/.well-known/openid-configuration",

  // Keep scope configurable so you can toggle fspt-r in Vercel without code changes
  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      response_type: "code",
      scope: process.env.YAHOO_SCOPE || "openid",
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

  // Yahoo signs ID tokens with ES256 — tell openid-client/NextAuth
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

// ---- NextAuth options ----
export const authOptions: AuthOptions = {
  providers: [yahooProvider],
  session: { strategy: "jwt" },
  debug: true,

  callbacks: {
    async jwt({ token, account }) {
      const t = token as AppToken;

      // First time sign-in: stash tokens from Yahoo
      if (account) {
        const acc = account as YahooAccount;
        return {
          ...t,
          access_token: acc.access_token ?? t.access_token,
          refresh_token: acc.refresh_token ?? t.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + (acc.expires_in ?? 3600),
        };
      }

      // If we have an expiry and it's still valid, keep it
      if (t.expires_at && Math.floor(Date.now() / 1000) < t.expires_at) {
        return t;
      }

      // Otherwise try to refresh
      return await refreshAccessToken(t);
    },

    async session({ session, token }) {
      const s = session as Session & { accessToken?: string };
      const t = token as AppToken;
      s.accessToken = t.access_token;
      return s;
    },
  },
};
