import NextAuth, { type AuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";

type YahooProfile = {
  sub: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
};

const yahooProvider: OAuthConfig<YahooProfile> = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",
  // Use Yahoo's OpenID metadata
  wellKnown: "https://api.login.yahoo.com/.well-known/openid-configuration",

  // Keep scopes you enabled in Yahoo console
  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      response_type: "code",
      scope: "openid email profile",
      code_challenge_method: "S256",
      redirect_uri: process.env.YAHOO_REDIRECT_URI!, // must match Yahoo console exactly
    },
  },

  token: {
    url: "https://api.login.yahoo.com/oauth2/get_token",
    params: { redirect_uri: process.env.YAHOO_REDIRECT_URI! },
  },

  userinfo: { url: "https://api.login.yahoo.com/openid/v1/userinfo" },

  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,

  // ✅ Workaround: don't validate id_token (avoids RS256 vs ES256 mismatch)
  idToken: false,

  checks: ["pkce", "state"],

  profile(p) {
    return {
      id: p.sub,
      name: p.name || p.nickname || "Yahoo User",
      email: p.email,
      image: p.picture,
    };
  },
};

const authOptions: AuthOptions = {
  providers: [yahooProvider],
  session: { strategy: "jwt" },
  debug: true,
  trustHost: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
