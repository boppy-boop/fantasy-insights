// app/api/auth/[...nextauth]/route.ts
// Minimal wrapper that forwards to the handlers defined in lib/auth.

import { handlers } from "../../../../lib/auth";

export const runtime = "nodejs";          // OAuth callbacks require Node runtime
export const dynamic = "force-dynamic";   // must not be statically rendered

export const { GET, POST } = handlers;
