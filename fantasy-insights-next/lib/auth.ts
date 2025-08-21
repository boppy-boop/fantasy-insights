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

export const yahooProvider: OAuthConfig<YahooProfile> = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",
  wellKnown: "https://api.login.yahoo.com/.well-known/openid-configuration",
  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      response_type: "code",
      scope: "openid", // use "openid email profile" only if enabled in Yahoo app
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
};
