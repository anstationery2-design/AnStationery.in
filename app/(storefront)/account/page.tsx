import { redirect } from "next/navigation";
import Link from "next/link";
import { Camera, LogOut, Mail, ShoppingBag, User } from "lucide-react";
import { getUserSession } from "@/lib/auth";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account | AN Stationery",
};

export default async function AccountPage() {
  const session = await getUserSession();

  // Require login — redirect to Google sign-in
  if (!session) {
    redirect("/login?from=/account");
  }

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-accent text-2xl font-bold text-yellow-deep">
        your account
      </p>
      <h1 className="mt-1 font-display text-4xl font-black tracking-tight sm:text-5xl">
        My Account
      </h1>

      <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4">
          {session.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.image}
              alt={session.name}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
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

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3">
            <Mail className="h-5 w-5 text-yellow-deep" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Email
              </p>
              <p className="font-semibold">{session.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3">
            <User className="h-5 w-5 text-yellow-deep" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Account ID
              </p>
              <p className="font-semibold break-all">{session.id}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 rounded-full bg-ink py-3 font-display text-sm font-bold text-white transition hover:bg-yellow hover:text-ink"
          >
            <ShoppingBag className="h-4 w-4" /> Start Shopping
          </Link>
          <a
            href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
              `Hi ${SITE.name}! I need help with my account (${session.email}).`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border-2 border-line py-3 font-display text-sm font-bold transition hover:border-ink"
          >
            <Camera className="h-4 w-4" /> Get Help
          </a>
        </div>

        {/* Logout form */}
        <form
          action="/api/auth/logout"
          method="post"
          className="mt-4"
          onSubmit={(e) => {
            // Let the form submit via the POST route
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-badge-sale/30 bg-badge-sale/10 py-3 font-semibold text-badge-sale transition hover:bg-badge-sale hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </form>
      </div>
    </div>
  );
}