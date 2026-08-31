import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { getUserSession } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { STATUS_COLORS, TRACK_STEPS } from "@/lib/constants";
import { formatINR } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-button";
import { DownloadInvoiceButton } from "@/components/account/download-invoice-button";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account | AN Stationery",
};

type OrderItem = {
  product_name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  subtotal: number;
};

type Order = {
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
  order_items?: OrderItem[];
  shipments?: { status: string; courier_name: string | null; tracking_number: string | null }[];
};

const PAYMENT_LABEL: Record<string, { label: string; className: string }> = {
  DELIVERED: { label: "Paid", className: "bg-badge-new/15 text-badge-new" },
  OUT_FOR_DELIVERY: { label: "Paid", className: "bg-badge-new/15 text-badge-new" },
  SHIPPED: { label: "Paid", className: "bg-badge-new/15 text-badge-new" },
  CONFIRMED: { label: "Pending", className: "bg-yellow-soft text-ink" },
  PROCESSING: { label: "Pending", className: "bg-yellow-soft text-ink" },
  NEW: { label: "Pending", className: "bg-yellow-soft text-ink" },
  CANCELLED: { label: "Refunded / N/A", className: "bg-badge-sale/15 text-badge-sale" },
};

async function fetchUserOrders(email: string): Promise<Order[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), shipments(*)")
    .eq("customer_email", email)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Order[];
}

export default async function AccountPage() {
  const session = await getUserSession();
  if (!session) redirect("/login?from=/account");

  const orders = await fetchUserOrders(session.email);
  const latestAddress = orders[0];

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const totalItems = orders.reduce(
    (sum, o) => sum + (o.order_items ?? []).reduce((s, i) => s + i.quantity, 0),
    0,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <p className="font-accent text-2xl font-bold text-yellow-deep">
        your account
      </p>
      <h1 className="mt-1 font-display text-4xl font-black tracking-tight sm:text-5xl">
        My Account
      </h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
        {/* ===== Profile + Address ===== */}
        <div className="space-y-6">
          {/* Profile card */}
          <section className="rounded-3xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {session.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.image}
                  alt={session.name}
                  className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-yellow"
                />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-yellow font-display text-xl font-black text-ink">
                  {initials}
                </span>
              )}
              <div>
                <h2 className="font-display text-xl font-black">{session.name}</h2>
                <p className="text-sm text-muted">Signed in with Google</p>
              </div>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3">
                <User className="h-5 w-5 shrink-0 text-yellow-deep" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Email
                  </p>
                  <p className="truncate font-semibold">{session.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3">
                <CreditCard className="h-5 w-5 shrink-0 text-yellow-deep" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Account ID
                  </p>
                  <p className="truncate font-semibold">{session.id}</p>
                </div>
              </div>
            </dl>

            <div className="mt-6 flex items-center justify-center gap-4 rounded-xl bg-yellow-soft px-4 py-3 text-center">
              <div>
                <p className="font-display text-2xl font-black">{orders.length}</p>
                <p className="text-xs font-semibold text-muted">Orders</p>
              </div>
              <div className="h-8 w-px bg-yellow-deep/30" />
              <div>
                <p className="font-display text-2xl font-black">{totalItems}</p>
                <p className="text-xs font-semibold text-muted">Items</p>
              </div>
            </div>
          </section>

          {/* Address card */}
          <section className="rounded-3xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-black">
                <MapPin className="h-5 w-5 text-yellow-deep" /> Delivery Address
              </h2>
            </div>
            {latestAddress ? (
              <address className="mt-3 not-italic">
                <p className="font-semibold">{latestAddress.customer_name}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {latestAddress.address}
                  <br />
                  {latestAddress.city}, {latestAddress.state} —{" "}
                  {latestAddress.pincode}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
                  <Phone className="h-4 w-4 text-yellow-deep" />{" "}
                  {latestAddress.customer_phone}
                </p>
              </address>
            ) : (
              <p className="mt-3 text-sm text-muted">
                No address saved yet. Add one at checkout.
              </p>
            )}
            <Link
              href="/shop"
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-ink py-3 font-display text-sm font-bold text-white transition hover:bg-yellow hover:text-ink"
            >
              <ShoppingBag className="h-4 w-4" /> Start Shopping
            </Link>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
                `Hi ${SITE.name}! I need help with my account (${session.email}).`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full border-2 border-line py-3 font-display text-sm font-bold transition hover:border-ink"
            >
              Get Help
            </a>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </section>
        </div>

        {/* ===== Orders ===== */}
        <section className="rounded-3xl border border-line bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-lg font-black">
            <Package className="h-5 w-5 text-yellow-deep" /> Your Orders
          </h2>

          {orders.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
              <div className="text-6xl">{"\ud83d\udced"}</div>
              <p className="font-semibold">No orders yet</p>
              <p className="text-sm text-muted">
                Your orders will show up here once you place them.
              </p>
              <Link
                href="/shop"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-yellow px-6 py-3 font-display text-sm font-bold text-ink transition hover:bg-yellow-deep"
              >
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-line bg-cream/50 p-5"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-black">
                        {order.order_number}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-muted">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[order.status] ?? "bg-cream text-ink"}`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          PAYMENT_LABEL[order.status]?.className ??
                          "bg-cream text-ink"
                        }`}
                      >
                        {PAYMENT_LABEL[order.status]?.label ?? "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-4 divide-y divide-line/60">
                    {(order.order_items ?? []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 shrink-0 text-yellow-deep" />
                          <span className="line-clamp-1 font-semibold">
                            {item.product_name_snapshot}
                          </span>
                          <span className="whitespace-nowrap text-muted">
                            × {item.quantity}
                          </span>
                        </div>
                        <span className="whitespace-nowrap font-semibold">
                          {formatINR(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted">Subtotal</dt>
                      <dd className="font-semibold">{formatINR(order.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Shipping</dt>
                      <dd className="font-semibold">
                        {order.shipping_amount === 0
                          ? "FREE"
                          : formatINR(order.shipping_amount)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-2 text-base font-black">
                      <dt>Total</dt>
                      <dd>{formatINR(order.total_amount)}</dd>
                    </div>
                  </dl>

                  {/* Courier info */}
                  {order.shipments?.some(
                    (s) => s.status && s.status !== "PENDING",
                  ) && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-pastel-mint px-4 py-2.5 text-sm font-semibold">
                      <Truck className="h-4 w-4 text-badge-new" />
                      {order.shipments[0].courier_name ?? "Courier"}
                      {order.shipments[0].tracking_number
                        ? ` — ${order.shipments[0].tracking_number}`
                        : ""}
                    </div>
                  )}

                  {/* Tracking timeline */}
                  {order.status !== "CANCELLED" ? (
                    <TrackingTimeline status={order.status} />
                  ) : (
                    <div className="mt-3 rounded-xl bg-badge-sale/15 px-4 py-2.5 text-sm font-semibold text-badge-sale">
                      This order has been cancelled.
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <DownloadInvoiceButton orderNumber={order.order_number} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TrackingTimeline({ status }: { status: string }) {
  const currentIdx = TRACK_STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="mt-4 flex items-center gap-1">
      {TRACK_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <li key={step.key} className="flex flex-1 flex-col items-center text-center">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-black ${
                done ? "bg-yellow text-ink" : "bg-cream text-muted"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={`mt-1 text-[10px] font-semibold leading-tight ${
                isCurrent ? "text-ink" : done ? "text-ink/70" : "text-muted"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
