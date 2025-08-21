import type { AuthOptions } from "next-auth";
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
  wellKnown: "https://api.login.yahoo.com/.well-known/openid-configuration",

  // Keep scopes minimal and *enabled in your Yahoo app*
  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      response_type: "code",
      scope: "openid email profile", // if this throws invalid_scope, drop to just "openid"
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

  // Yahoo ID tokens are ES256
  client: {
    token_endpoint_auth_method: "client_secret_basic",
    id_token_signed_response_alg: "ES256",
    authorization_signed_response_alg: "ES256",
  },

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

export const authOptions: AuthOptions = {
  providers: [yahooProvider],
  session: { strategy: "jwt" },
  debug: true,
};
