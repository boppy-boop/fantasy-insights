"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button
        disabled
        className="rounded-xl bg-zinc-800/70 px-5 py-3 text-white"
      >
        Checking session…
      </button>
    );
  }

  if (status === "authenticated") {
    return (
      <button
        onClick={() => signOut()}
        className="rounded-xl bg-zinc-800/80 px-5 py-3 font-medium text-white shadow transition hover:bg-zinc-700"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("yahoo")}
      className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-900/30 transition hover:scale-[1.02]"
    >
      Sign in with Yahoo
    </button>
  );
}
