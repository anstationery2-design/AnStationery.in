import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay env vars missing on Vercel");
    return NextResponse.json(
      { error: "Payment gateway not configured. Please contact support." },
      { status: 500 },
    );
  }

  let body: { amount?: number; currency?: string; receipt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const amount = body.amount;
  if (typeof amount !== "number" || amount < 100 || !Number.isInteger(amount)) {
    return NextResponse.json(
      { error: "Invalid amount" },
      { status: 400 },
    );
  }

  try {
    // Use the Razorpay server SDK (already installed - handles auth and API calls)
    const Razorpay = (await import("razorpay")).default;
    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await rzp.orders.create({
      amount,
      currency: body.currency || "INR",
      receipt: body.receipt || `rcpt_${Date.now()}`,
      payment_capture: true,
      notes: {},
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: unknown) {
    const error = err as { message?: string; statusCode?: number; error?: { description?: string } };
    console.error("Razorpay error:", error?.message || error);
    const msg =
      error?.error?.description ||
      error?.message ||
      "Payment could not be initiated";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}