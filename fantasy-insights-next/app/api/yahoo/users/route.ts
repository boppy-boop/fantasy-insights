import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

type Ok = { ok: true; user: { id?: string; email?: string; name?: string } };
type NotAuthed = { ok: false; error: "UNAUTHORIZED" };

export async function GET(): Promise<NextResponse<Ok | NotAuthed>> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Stub: return minimal user data (you can later call Yahoo userinfo here)
  return NextResponse.json({
    ok: true,
    user: {
      id: session.user?.email ?? undefined,
      email: session.user?.email ?? undefined,
      name: session.user?.name ?? undefined,
    },
  });
}
