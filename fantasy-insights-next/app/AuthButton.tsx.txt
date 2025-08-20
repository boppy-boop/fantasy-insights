"use client"
import { signIn, signOut, useSession } from "next-auth/react"

export default function AuthButton() {
  const { data: session, status } = useSession()
  if (status === "loading") return <button disabled>Loading…</button>
  if (!session) return <button onClick={() => signIn("yahoo")}>Sign in with Yahoo</button>
  return <button onClick={() => signOut()}>Sign out</button>
}
