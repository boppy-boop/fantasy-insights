// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

// Re-export NextAuth handlers (GET/POST) from your existing config.
// Works for both NextAuth v5 (handlers present) and v4 (our lib/auth.ts supplies a fallback).
export const { GET, POST } = handlers;

export const runtime = "nodejs";
