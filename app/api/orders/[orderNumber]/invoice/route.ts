import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { getUserOrderByNumber } from "@/lib/data";
import { generateInvoicePdf, type InvoiceOrder } from "@/lib/invoice";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderNumber } = await params;
  const order = (await getUserOrderByNumber(orderNumber, session.email)) as RawOrder | null;
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const pdf = await generateInvoicePdf(toInvoiceOrder(order));
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.order_number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

type RawOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: {
    product_name_snapshot: string;
    price_snapshot: number;
    quantity: number;
    subtotal: number;
  }[];
};

function toInvoiceOrder(o: RawOrder): InvoiceOrder {
  return {
    orderNumber: o.order_number,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerEmail: o.customer_email,
    address: o.address,
    city: o.city,
    state: o.state,
    pincode: o.pincode,
    subtotal: o.subtotal,
    shippingAmount: o.shipping_amount,
    totalAmount: o.total_amount,
    status: o.status,
    createdAt: o.created_at,
    items: o.items.map((it) => ({
      productNameSnapshot: it.product_name_snapshot,
      priceSnapshot: it.price_snapshot,
      quantity: it.quantity,
      subtotal: it.subtotal,
    })),
  };
}
