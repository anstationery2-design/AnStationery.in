import { NextResponse } from "next/server";
import { z } from "zod";

const VerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Missing payment verification details",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    parsed.data;

  try {
    // Razorpay signature verification (standard HMAC SHA256)
    const crypto = await import("node:crypto");
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed — signature mismatch" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { verified: true, razorpay_order_id, razorpay_payment_id },
      { status: 200 },
    );
  } catch (err) {
    console.error("Razorpay verify error:", err);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}