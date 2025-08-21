"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button
        disabled
        className="rounded-xl bg-zinc-800 px-4 py-2 text-zinc-300"
        aria-busy="true"
      >
        Checking…
      </button>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-300">
          Signed in{session?.user?.name ? ` as ${session.user.name}` : ""}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-xl bg-zinc-200 px-4 py-2 text-zinc-900 hover:bg-zinc-700/10"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("yahoo")}
      className="rounded-xl bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-500"
    >
      Sign in with Yahoo
    </button>
  );
}
