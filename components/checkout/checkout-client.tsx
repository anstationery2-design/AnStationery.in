"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { ArrowRight, Loader2, Lock, CreditCard, Banknote } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { formatINR } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
};

type RazorpayInstance = {
  open: () => void;
  close: () => void;
};

type PaymentMethod = "COD" | "RAZORPAY";

export function CheckoutClient({ user }: { user: { name: string; email: string } }) {
  const { lines, subtotal, shipping, total, clear } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const loadRazorpayScript = useCallback(async () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    return new Promise<void>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => { setRazorpayLoaded(true); resolve(); };
      script.onerror = () => {
        setServerError("Failed to load payment gateway. Please try again.");
        resolve();
      };
      document.body.appendChild(script);
    });
  }, []);

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <div className="text-7xl">{"\ud83d\uded2"}</div>
        <h1 className="font-display text-3xl font-black">Nothing to check out</h1>
        <p className="text-muted">Add some cute things to your cart first.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-display text-sm font-bold text-white transition hover:bg-primary-hover hover:text-white"
        >
          Shop now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setServerError("");
    setErrors({});

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: form.get("customerName") as string,
      customerPhone: form.get("customerPhone") as string,
      customerEmail: (form.get("customerEmail") as string) || "",
      address: form.get("address") as string,
      city: form.get("city") as string,
      state: form.get("state") as string,
      pincode: form.get("pincode") as string,
      lines: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
    };

    try {
      if (paymentMethod === "RAZORPAY") {
        if (!razorpayLoaded) await loadRazorpayScript();
        if (!window.Razorpay) {
          setServerError("Payment gateway is not available. Please try again or choose Cash on Delivery.");
          setSubmitting(false);
          return;
        }

        const rpRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total * 100,
            receipt: "receipt_" + Date.now(),
            notes: { customerName: payload.customerName },
          }),
        });

        const rpData = await rpRes.json();
        if (!rpRes.ok) {
          setServerError(rpData.error || "Payment could not be initiated.");
          setSubmitting(false);
          return;
        }

        const rpOrder = rpData.order;
        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TWPv9RYOJEpf2u";

        const razorpay = new window.Razorpay({
          key,
          amount: rpOrder.amount,
          currency: rpOrder.currency,
          name: "AN Stationery",
          description: "Order for " + payload.customerName,
          order_id: rpOrder.id,
          prefill: { name: payload.customerName, email: payload.customerEmail, contact: payload.customerPhone },
          handler: async (response) => {
            const vRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const vData = await vRes.json();
            if (!vRes.ok || !vData.verified) {
              setServerError("Payment verification failed. Please contact support.");
              setSubmitting(false);
              return;
            }
            const oRes = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...payload,
                paymentMethod: "RAZORPAY",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const oData = await oRes.json();
            if (!oRes.ok) {
              setServerError(oData.error || "Order could not be placed after payment.");
              setSubmitting(false);
              return;
            }
            clear();
            router.push("/order-confirmation/" + oData.order.orderNumber + "?o=" + encodeURIComponent(JSON.stringify(oData.order)));
          },
          modal: { ondismiss: () => { setSubmitting(false); setServerError("Payment was cancelled."); } },
          theme: { color: "#145A2A" },
        });
        razorpay.open();
      } else {
        const oRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, paymentMethod: "COD" }),
        });
        const oData = await oRes.json();
        if (!oRes.ok) {
          if (oData.issues) setErrors(oData.issues);
          else setServerError(oData.error || "Order could not be placed.");
          setSubmitting(false);
          return;
        }
        clear();
        router.push("/order-confirmation/" + oData.order.orderNumber + "?o=" + encodeURIComponent(JSON.stringify(oData.order)));
      }
    } catch {
      setServerError("Order could not be placed. Please try again.");
      setSubmitting(false);
    }
  };

  const field = (name: string) =>
    errors[name] ? errors[name][0] : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-display text-3xl font-black tracking-tight sm:text-4xl">Checkout</h1>
      <p className="mb-6 text-sm text-muted">
        Signed in as <span className="font-semibold text-ink">{user.name}</span> ({user.email})
      </p>

      {serverError && (
        <div className="mb-6 rounded-xl border border-badge-sale/30 bg-badge-sale/10 px-4 py-3 text-sm text-badge-sale">{serverError}</div>
      )}

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5 rounded-2xl border border-line bg-white p-5">
          <div>
            <h2 className="font-display text-lg font-black">Delivery Details</h2>
            <p className="text-sm text-muted">All fields are required.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" name="customerName" placeholder="Your full name" defaultValue={user.name} error={field("customerName")} />
            <Input label="Phone" name="customerPhone" type="tel" placeholder="98XXXXXXXX" error={field("customerPhone")} />
          </div>

          <Input label="Email (optional, for order updates)" name="customerEmail" type="email" placeholder="your@email.com" defaultValue={user.email} error={field("customerEmail")} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Pincode" name="pincode" placeholder="400001" error={field("pincode")} />
            <Input label="City" name="city" placeholder="Mumbai" error={field("city")} />
            <Input label="State" name="state" placeholder="Maharashtra" error={field("state")} />
          </div>

          <Input label="Address" name="address" placeholder="House no, street, area, landmark" error={field("address")} />

          <div>
            <h3 className="mb-2 font-display text-base font-black">Payment Method</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setPaymentMethod("COD")}
                className={"flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition " + (paymentMethod === "COD" ? "border-primary bg-primary/10" : "border-line bg-cream hover:border-primary/50")}>
                <Banknote className={"h-5 w-5 " + (paymentMethod === "COD" ? "text-primary-hover" : "text-muted")} />
                <div>
                  <p className="text-sm font-bold">Cash on Delivery</p>
                  <p className="text-xs text-muted">Pay when you receive</p>
                </div>
              </button>
              <button type="button" onClick={() => setPaymentMethod("RAZORPAY")}
                className={"flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition " + (paymentMethod === "RAZORPAY" ? "border-primary bg-primary/10" : "border-line bg-cream hover:border-primary/50")}>
                <CreditCard className={"h-5 w-5 " + (paymentMethod === "RAZORPAY" ? "text-primary-hover" : "text-muted")} />
                <div>
                  <p className="text-sm font-bold">Pay Online</p>
                  <p className="text-xs text-muted">Card / UPI / Net Banking</p>
                </div>
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-display text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : paymentMethod === "RAZORPAY" ? <CreditCard className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {submitting ? "Processing..." : paymentMethod === "RAZORPAY" ? "Pay Online - " + formatINR(total) : "Place Order - " + formatINR(total)}
          </button>

          {paymentMethod === "RAZORPAY" && (
            <p className="text-center text-xs text-muted">Secured by Razorpay. Your payment info is encrypted.</p>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-cream p-5">
          <h2 className="font-display text-lg font-black">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {lines.map((line) => (
              <div key={line.slug} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                  <Image src={line.image} alt={line.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col text-sm">
                  <span className="line-clamp-1 font-semibold">{line.name}</span>
                  <span className="text-muted">Qty {line.quantity}</span>
                </div>
                <span className="text-sm font-bold">{formatINR(line.price * line.quantity)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold">{formatINR(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="font-semibold">{shipping === 0 ? "FREE" : formatINR(shipping)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-black"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
          </dl>
        </aside>
      </form>
    </div>
  );
}

function Input({ label, name, type = "text", placeholder, defaultValue, error }: {
  label: string; name: string; type?: string; placeholder?: string; defaultValue?: string; error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue}
        className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-primary" />
      {error && <span className="mt-1 block text-xs text-badge-sale">{error}</span>}
    </label>
  );
}
