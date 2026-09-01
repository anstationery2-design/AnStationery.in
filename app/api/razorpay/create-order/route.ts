import { NextResponse } from "next/server";
import { z } from "zod";

const CreateOrderSchema = z.object({
  amount: z.number().int().min(1, "Amount must be at least ₹1"),
  currency: z.string().default("INR"),
  receipt: z.string().optional(),
  notes: z.object({}).passthrough().optional(),
});

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
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

  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { amount, currency, receipt, notes } = parsed.data;

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount,          // paise (₹1 = 100 paise)
        currency,
        receipt: receipt ?? `receipt_${Date.now()}`,
        notes: notes ?? {},
        payment_capture: 1, // auto-capture
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.error?.description ?? "Razorpay order creation failed" },
        { status: 500 },
      );
    }

    const order = await res.json();
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json(
      { error: "Could not create Razorpay order" },
      { status: 500 },
    );
  }
}