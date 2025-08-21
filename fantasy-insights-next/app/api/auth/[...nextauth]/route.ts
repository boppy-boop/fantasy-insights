import NextAuth, { type NextAuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";
import type { Account, DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

/** Shape of Yahoo's OpenID userinfo response we use */
type YahooProfile = {
  sub: string;
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
};

/** Yahoo provider with explicit redirect_uri and minimal scope */
const yahooProvider: OAuthConfig<YahooProfile> = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth",
  checks: ["pkce", "state"],

  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      response_type: "code",
      scope: "openid", // keep minimal while stabilizing
      code_challenge_method: "S256",
      redirect_uri: process.env.YAHOO_REDIRECT_URI!, // must match Yahoo console exactly
    },
  },

  token: {
    url: "https://api.login.yahoo.com/oauth2/get_token",
    // include redirect_uri in token exchange to avoid provider rejections
    params: { redirect_uri: process.env.YAHOO_REDIRECT_URI! },
  },

  userinfo: { url: "https://api.login.yahoo.com/openid/v1/userinfo" },

  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  client: { token_endpoint_auth_method: "client_secret_basic" },

  profile(p) {
    return {
      id: p.sub,
      name: p.name ?? p.nickname ?? "Yahoo User",
      email: p.email,
      image: p.picture,
    };
  },
};

/** NextAuth options (not exported — only GET/POST are exported for App Router) */
const options: NextAuthOptions = {
  providers: [yahooProvider],
  session: { strategy: "jwt" },
  debug: true,

  callbacks: {
    async jwt({ token, account }) {
      // Persist access_token on first sign-in
      if (account) {
        const acc = account as Account & { access_token?: string };
        if (acc.access_token) token.access_token = acc.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose access_token in the session (typed safely)
      (session as DefaultSession & { access_token?: string }).access_token = (token as JWT & {
        access_token?: string;
      }).access_token;
      return session;
    },
  },
};

const handler = NextAuth(options);
export { handler as GET, handler as POST };
