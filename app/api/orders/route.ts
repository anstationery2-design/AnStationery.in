import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SITE } from "@/lib/constants";
import { getUserSession } from "@/lib/auth";

export async function POST(request: Request) {
  // Security: only signed-in users can place orders. Server-side check —
  // cannot be bypassed by calling the API directly.
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to place an order." },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // --- Manual validation (avoids Zod v4 compatibility issues) ---

  const customerName = String(body.customerName || "");
  if (customerName.length < 2) {
    return NextResponse.json({ error: "Please enter your full name" }, { status: 400 });
  }

  const customerPhone = String(body.customerPhone || "");
  if (!/^[6-9]\d{9}$/.test(customerPhone)) {
    return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number" }, { status: 400 });
  }

  const customerEmail = String(body.customerEmail || "");

  const address = String(body.address || "");
  if (address.length < 8) {
    return NextResponse.json({ error: "Please enter a complete address" }, { status: 400 });
  }

  const city = String(body.city || "");
  if (city.length < 2) {
    return NextResponse.json({ error: "Please enter your city" }, { status: 400 });
  }

  const state = String(body.state || "");
  if (state.length < 2) {
    return NextResponse.json({ error: "Please enter your state" }, { status: 400 });
  }

  const pincode = String(body.pincode || "");
  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Enter a valid 6-digit pincode" }, { status: 400 });
  }

  const lines = body.lines;
  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  // Validate each line
  for (const line of lines) {
    if (typeof line !== "object" || !line) {
      return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
    }
    const l = line as Record<string, unknown>;
    if (typeof l.slug !== "string" || !l.slug) {
      return NextResponse.json({ error: "Invalid cart item slug" }, { status: 400 });
    }
    const qty = Number(l.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
      return NextResponse.json({ error: "Invalid quantity for " + l.slug }, { status: 400 });
    }
  }

  // Payment fields
  const paymentMethod = String(body.paymentMethod || "COD");
  const razorpayOrderId = String(body.razorpayOrderId || "");
  const razorpayPaymentId = String(body.razorpayPaymentId || "");
  const razorpaySignature = String(body.razorpaySignature || "");

  // Call the create_order RPC (atomic: validates stock, creates order,
  // creates items with snapshots, decrements stock — all in one transaction)
  const { data: order, error } = await supabase.rpc("create_order", {
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_email: customerEmail || "",
    p_address: address,
    p_city: city,
    p_state: state,
    p_pincode: pincode,
    p_lines: lines.map((l: Record<string, unknown>) => ({
      slug: l.slug,
      quantity: Number(l.quantity),
    })),
    p_shipping_threshold: SITE.freeShippingThreshold,
    p_shipping_fee: SITE.shippingFee,
    p_payment_method: paymentMethod,
    p_razorpay_order_id: razorpayOrderId || null,
    p_razorpay_payment_id: razorpayPaymentId || null,
    p_razorpay_signature: razorpaySignature || null,
  });

  if (error) {
    const msg = error.message ?? "Order could not be placed.";
    const isStockError = msg.includes("available") || msg.includes("not available");
    return NextResponse.json(
      { error: msg },
      { status: isStockError ? 409 : 500 },
    );
  }

  // Notify the customer + the admin
  if (customerEmail) {
    await supabase.from("notifications").insert({
      user_email: customerEmail,
      order_number: order?.orderNumber ?? null,
      type: "ORDER_STATUS",
      title: "Order Placed",
      message: `Thanks ${customerName}! Your order #${order?.orderNumber ?? ""} was placed successfully.`,
      status: "NEW",
      is_read: false,
    });
  }
  await supabase.from("notifications").insert({
    user_email: process.env.ADMIN_EMAIL || "Anstationery2@gmail.com",
    order_number: order?.orderNumber ?? null,
    type: "ADMIN",
    title: "New Order Received",
    message: `New order #${order?.orderNumber ?? ""} for Rs. ${order?.totalAmount ?? 0} from ${customerName}. Payment: ${paymentMethod}`,
    status: "NEW",
    is_read: false,
  });

  return NextResponse.json({ order }, { status: 201 });
}
