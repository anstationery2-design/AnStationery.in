import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { adminUpdateShipment, adminUpdateOrderStatus } from "@/lib/data";
import { SHIPMENT_TO_ORDER_STATUS, SHIPMENT_STATUSES } from "@/lib/constants";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  // Derive the shipment status: explicit status if valid, otherwise auto from
  // courier/tracking presence.
  let shipmentStatus = body.status as string;
  if (!(SHIPMENT_STATUSES as readonly string[]).includes(shipmentStatus)) {
    shipmentStatus =
      body.courierName && body.trackingNumber ? "SHIPPED" : "PENDING";
  }

  await adminUpdateShipment(id, {
    courierName: body.courierName,
    trackingNumber: body.trackingNumber,
    trackingUrl: body.trackingUrl,
    status: shipmentStatus,
  });

  // Keep the order status in sync with the shipment the customer sees.
  const orderStatus = SHIPMENT_TO_ORDER_STATUS[shipmentStatus];
  if (orderStatus) {
    await adminUpdateOrderStatus(id, orderStatus);
  }

  return NextResponse.json({ ok: true, shipmentStatus, orderStatus });
}
