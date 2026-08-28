import { NextResponse } from "next/server";
import { adminLogout } from "@/lib/auth";

export async function POST() {
  await adminLogout();
  return NextResponse.json({ ok: true });
}
