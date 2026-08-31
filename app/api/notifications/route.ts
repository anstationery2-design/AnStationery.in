import { NextResponse } from "next/server";
import { getAnySession } from "@/lib/auth";
import { getUserNotifications } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAnySession();
  if (!session) return NextResponse.json({ notifications: [], unread: 0 });

  const { notifications, unread } = await getUserNotifications(session.email);
  return NextResponse.json({ notifications, unread });
}
