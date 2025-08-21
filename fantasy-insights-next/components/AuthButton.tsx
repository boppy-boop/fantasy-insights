// components/AuthButton.tsx
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { status } = useSession();

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
      <button
        onClick={() => signOut()}
        className="rounded-xl bg-zinc-800 px-4 py-2 text-zinc-200 hover:bg-zinc-700"
      >
        Sign out
      </button>
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
