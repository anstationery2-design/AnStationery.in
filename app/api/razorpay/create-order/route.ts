import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error(
      "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Add them in Vercel Dashboard → Project Settings → Environment Variables.",
    );
    return NextResponse.json(
      { error: "Razorpay is not configured on the server. Please contact the store owner." },
      { status: 500 },
    );
  }

  let body: { amount?: number; currency?: string; receipt?: string; notes?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Manual validation (no Zod dependency needed for this simple check)
  const amount = body.amount;
  if (typeof amount !== "number" || amount < 100 || !Number.isInteger(amount)) {
    return NextResponse.json(
      { error: "Invalid amount. Minimum is ₹1 (100 paise)." },
      { status: 400 },
    );
  }

  const currency = body.currency || "INR";
  const receipt = body.receipt || `rcpt_${Date.now()}`;
  const notes = body.notes || {};

  const payload = {
    amount,
    currency,
    receipt,
    notes,
    payment_capture: 1,
  };

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json();

    if (!res.ok) {
      console.error("Razorpay API error:", res.status, responseData);
      const msg =
        responseData?.error?.description ||
        responseData?.error?.code ||
        `Razorpay returned status ${res.status}`;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ order: responseData }, { status: 201 });
  } catch (err) {
    console.error("Razorpay create-order exception:", err);
    return NextResponse.json(
      { error: "Could not connect to Razorpay. Please try again later." },
      { status: 500 },
    );
  }
}