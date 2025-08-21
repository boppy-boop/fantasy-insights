import NextAuth, { type AuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";

// Yahoo OpenID profile shape (minimal)
type YahooProfile = {
  sub: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
};

// ---- Yahoo provider (ES256 + explicit redirect_uri) ----
const yahooProvider = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",

  // Use Yahoo's OpenID discovery
  wellKnown: "https://api.login.yahoo.com/.well-known/openid-configuration",

  // Keep scope minimal first; once working, you can switch to "openid email profile"
  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      response_type: "code",
      scope: "openid",
      code_challenge_method: "S256",
      redirect_uri: process.env.YAHOO_REDIRECT_URI!, // MUST exactly match Yahoo console
    },
  },

  token: {
    url: "https://api.login.yahoo.com/oauth2/get_token",
    params: { redirect_uri: process.env.YAHOO_REDIRECT_URI! },
  },

  userinfo: { url: "https://api.login.yahoo.com/openid/v1/userinfo" },

  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,

  // Tell openid-client/NextAuth the expected signing alg is ES256
  client: {
    token_endpoint_auth_method: "client_secret_basic",
    id_token_signed_response_alg: "ES256",
    authorization_signed_response_alg: "ES256",
  },

  // nonce is required for ID token validation
  checks: ["pkce", "state", "nonce"] as const,

  profile(profile: YahooProfile) {
    return {
      id: profile.sub,
      name: profile.name ?? profile.nickname ?? "Yahoo User",
      email: profile.email,
      image: profile.picture,
    };
  },
} satisfies OAuthConfig<YahooProfile>;

// ---- NextAuth config ----
const authOptions: AuthOptions = {
  providers: [yahooProvider],
  session: { strategy: "jwt" },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
