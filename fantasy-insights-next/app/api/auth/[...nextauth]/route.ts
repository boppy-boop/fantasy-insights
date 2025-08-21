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

// ---- Yahoo provider (forces ES256 + exact redirect_uri) ----
const yahooProvider: OAuthConfig<YahooProfile> = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",

  // Use Yahoo's OpenID discovery
  wellKnown: "https://api.login.yahoo.com/.well-known/openid-configuration",

  // Keep scope minimal to avoid "invalid_scope"
  // If you enabled Email + Profile in the Yahoo app, you can use: "openid email profile"
  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      response_type: "code",
      scope: "openid", // change to "openid email profile" only if those scopes are enabled in your Yahoo app
      code_challenge_method: "S256",
      redirect_uri: process.env.YAHOO_REDIRECT_URI!, // must EXACTLY match the Yahoo app setting
    },
  },

  token: {
    url: "https://api.login.yahoo.com/oauth2/get_token",
    // Some providers require redirect_uri during token exchange — include explicitly
    params: { redirect_uri: process.env.YAHOO_REDIRECT_URI! },
  },

  userinfo: { url: "https://api.login.yahoo.com/openid/v1/userinfo" },

  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,

  // ✅ Tell NextAuth/openid-client that Yahoo signs ID tokens with ES256
  client: {
    token_endpoint_auth_method: "client_secret_basic",
    id_token_signed_response_alg: "ES256",
    authorization_signed_response_alg: "ES256",
  },

  // nonce is required for ID token validation
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

const authOptions: AuthOptions = {
  providers: [yahooProvider],
  session: { strategy: "jwt" },
  debug: true,
  // Helpful on Vercel behind a proxy
  trustHost: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
