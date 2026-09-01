import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured" },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const razorpay_order_id = String(body.razorpay_order_id || "");
  const razorpay_payment_id = String(body.razorpay_payment_id || "");
  const razorpay_signature = String(body.razorpay_signature || "");

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: "Missing payment verification details" },
      { status: 400 },
    );
  }

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