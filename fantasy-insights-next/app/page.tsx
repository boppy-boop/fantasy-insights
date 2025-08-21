"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export const dynamic = "force-dynamic";

export default function Home() {
  const { data: session, status } = useSession();

  async function callUserInfo() {
    const res = await fetch("/api/yahoo/user");
    const text = await res.text();
    alert(text);
  }

  async function callLeagues() {
    const res = await fetch("/api/yahoo/leagues");
    const text = await res.text();
    alert(text);
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Fantasy Insights</h1>

        {status === "authenticated" ? (
          <>
            <p>
              Signed in as{" "}
              <b>
                {session?.user?.email ?? session?.user?.name ?? "Yahoo User"}
              </b>
            </p>

            <div className="space-x-2">
              <button
                onClick={callUserInfo}
                className="px-3 py-2 rounded bg-zinc-800 text-white"
              >
                Test Yahoo Userinfo
              </button>

              <button
                onClick={callLeagues}
                className="px-3 py-2 rounded bg-indigo-700 text-white"
                title="Requires fspt-r scope enabled in your Yahoo app"
              >
                Load Yahoo Leagues
              </button>
            </div>

            <div>
              <button
                onClick={() => signOut()}
                className="px-3 py-2 rounded bg-zinc-700 text-white mt-2"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <>
            <p>Sign in to load your Yahoo League Data.</p>
            <button
              onClick={() => signIn("yahoo")}
              className="px-3 py-2 rounded bg-purple-700 text-white"
            >
              Sign in with Yahoo
            </button>
          </>
        )}
      </div>
    </main>
  );
}
