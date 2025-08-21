import NextAuth, { type AuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";

// Yahoo OpenID profile shape
type YahooProfile = {
  sub: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
};

// ---- Yahoo provider (ES256 + explicit redirect_uri) ----
const yahooProvider: OAuthConfig<YahooProfile> = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",
  wellKnown: "https://api.login.yahoo.com/.well-known/openid-configuration",

  // Ask only for stable, OIDC scopes you enabled in the Yahoo app
  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      response_type: "code",
      scope: "openid email profile", // safe if you enabled Email + Profile in the app
      code_challenge_method: "S256",
      redirect_uri: process.env.YAHOO_REDIRECT_URI!, // force exact prod URL
    },
  },

  token: {
    url: "https://api.login.yahoo.com/oauth2/get_token",
    // include redirect_uri in the token request as some providers require it
    params: { redirect_uri: process.env.YAHOO_REDIRECT_URI! },
  },

  userinfo: { url: "https://api.login.yahoo.com/openid/v1/userinfo" },

  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,

  // ✅ Yahoo uses ES256 for ID tokens. Tell NextAuth to accept it.
  client: {
    id_token_signed_response_alg: "ES256",
    authorization_signed_response_alg: "ES256",
  },

  // Optional: explicit checks
  checks: ["pkce", "state"],

  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name || profile.nickname || "Yahoo User",
      email: profile.email,
      image: profile.picture,
    };
  },
};

const authOptions: AuthOptions = {
  providers: [yahooProvider],
  session: { strategy: "jwt" },
  debug: true,
  // Helps on Vercel so host/URL inference is trusted behind the proxy
  trustHost: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
