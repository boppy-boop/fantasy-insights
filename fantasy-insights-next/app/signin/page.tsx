// app/signin/page.tsx
"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Choose a method below. The button calls{" "}
          <code className="text-zinc-300">signIn('yahoo')</code>. The link opens
          NextAuth’s built-in sign-in page.
        </p>

        <div className="mt-6 space-y-3">
          {/* JS path */}
          <button
            onClick={() =>
              signIn("yahoo", {
                callbackUrl: "/fantasy",
              })
            }
            className="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-500"
          >
            Continue with Yahoo
          </button>

          {/* Non-JS fallback path */}
          <Link
            href="/api/auth/signin"
            className="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-center font-medium text-zinc-200 hover:bg-zinc-700"
            prefetch={false}
          >
            Open NextAuth sign-in page
          </Link>
        </div>

        <div className="mt-4 text-xs text-zinc-500">
          If neither works, your environment or Yahoo app callback is likely
          misconfigured.
        </div>
      </div>
    </main>
  );
}
