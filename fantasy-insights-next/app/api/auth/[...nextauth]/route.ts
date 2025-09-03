// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

// Re-export NextAuth handlers (GET/POST) from your existing config
export const { GET, POST } = handlers;

export const runtime = "nodejs";
