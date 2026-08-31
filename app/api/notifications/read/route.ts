import { NextResponse } from "next/server";
import { getAnySession } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getAnySession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await markNotificationsRead(session.email);
  return NextResponse.json({ ok: true });
}
