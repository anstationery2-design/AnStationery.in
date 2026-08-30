import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout | AN Stationery",
};

export default async function CheckoutPage() {
  // Security: checkout requires a signed-in user. Verified server-side so
  // it cannot be bypassed from the browser/API.
  const session = await getUserSession();
  if (!session) {
    redirect("/login?from=/checkout");
  }

  return <CheckoutClient user={{ name: session.name, email: session.email }} />;
}