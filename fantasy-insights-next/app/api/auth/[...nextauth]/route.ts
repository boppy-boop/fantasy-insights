// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";            // if this errors, try: import NextAuth from "next-auth/next";
import Credentials from "next-auth/providers/credentials";

export const runtime = "nodejs";

// Minimal credentials provider so the route always exports GET/POST.
// Swap in your real providers later.
const handler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Demo",
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        const name = credentials?.username?.trim();
        if (!name) return null;
        // Return a basic user object
        return { id: name, name, email: `${name}@example.com` };
      },
    }),
  ],
});

export { handler as GET, handler as POST };
