import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { randomUUID } from "crypto";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
// Public bucket for product media. Create it + RLS once via supabase-schema.sql
// (search for "product-images" below). Only uploads go through this bucket — no
// server filesystem is used, so it works on Vercel's read-only/ephemeral disk.
const BUCKET = "product-images";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData
      .getAll("images")
      .filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY." },
        { status: 500 },
      );
    }

    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        errors.push(`${file.name}: unsupported type`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        errors.push(`${file.name}: too large (max 5MB)`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

      if (error) {
        errors.push(`${file.name}: ${error.message}`);
        continue;
      }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      if (pub?.publicUrl) urls.push(pub.publicUrl);
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: errors.join("; ") || "No valid files uploaded" },
        { status: 400 },
      );
    }

    return NextResponse.json({ urls, errors });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
