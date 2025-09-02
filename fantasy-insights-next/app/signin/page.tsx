"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);

  async function handleYahooSignIn() {
    try {
      setLoading(true);
      // Send users to Yahoo, then back to /fantasy on success
      await signIn("yahoo", { callbackUrl: "/fantasy" });
    } finally {
      // This will not run if the browser navigates away immediately after signIn,
      // but it is fine for local UX (e.g., popup blockers).
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl shadow-purple-950/30 p-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Sign In</h1>
          <p className="text-zinc-400 mt-2">
            Connect Yahoo to pull your leagues, matchups, and standings.
          </p>
        </header>

        <button
          onClick={handleYahooSignIn}
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold
                     bg-purple-700 hover:bg-purple-600 disabled:opacity-60 disabled:cursor-not-allowed
                     transition-colors duration-200 shadow-lg shadow-purple-900/40"
          aria-busy={loading}
          aria-label="Sign in with Yahoo"
        >
          {loading ? "Redirecting…" : "Sign in with Yahoo"}
        </button>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-zinc-200 underline underline-offset-4"
          >
            Back to home
          </Link>
        </div>

        <div className="mt-6 text-xs text-zinc-500">
          <p>
            If clicking the button appears to do nothing, check for popup
            blockers or privacy extensions, and make sure the environment
            variables are set: <code>YAHOO_CLIENT_ID</code>,{" "}
            <code>YAHOO_CLIENT_SECRET</code>, and <code>NEXTAUTH_URL</code>.
          </p>
        </div>
      </div>
    </main>
  );
}
