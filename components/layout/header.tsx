"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { useCart } from "@/components/cart/cart-context";
import { NotificationBell } from "@/components/layout/notification-bell";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    image?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setUser(d?.user ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-white/90 backdrop-blur transition-shadow",
        scrolled ? "shadow-sm" : "shadow-none",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 lg:flex-none">
          <span className="font-display text-base font-black tracking-tight sm:text-xl">
            AN <span className="text-yellow-deep">Stationery</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "text-ink"
                    : "text-muted hover:text-ink",
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-yellow" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <NotificationBell email={user?.email ?? ""} />
          <button
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href={user ? "/account" : "/login"}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-cream"
            aria-label="Account"
          >
            {user ? (
              <>
                <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-yellow font-display text-sm font-black text-ink">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    user.name.trim().charAt(0).toUpperCase() || "U"
                  )}
                </span>
                <span className="hidden max-w-[90px] truncate text-sm font-bold lg:block">
                  {user.name.trim().split(" ")[0]}
                </span>
              </>
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-line text-muted">
                <User className="h-4 w-4" />
              </span>
            )}
          </Link>
          <button
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-cream"
            onClick={() => setOpen(true)}
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-yellow px-1 text-[10px] font-black text-ink animate-pop">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-line bg-white px-4 py-3 sm:px-6 lg:px-8">
          <form
            action="/shop"
            className="mx-auto flex max-w-3xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                placeholder="Search for journals, pens, gifts..."
                className="w-full rounded-full border border-line bg-cream py-3 pl-11 pr-4 text-sm outline-none focus:border-yellow-deep"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink-soft"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile drawer — rendered via portal to <body> so the header's
          backdrop-blur doesn't trap the fixed overlay to the header box */}
      {mobileOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 flex h-full w-80 max-w-[85%] flex-col overflow-y-auto bg-yellow-soft p-5 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display text-lg font-black">
                  AN <span className="text-yellow-deep">Stationery</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-sm hover:bg-cream"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl bg-white px-4 py-3 text-base font-bold text-ink shadow-sm transition hover:bg-yellow hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 border-t border-yellow-deep/30 pt-4">
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold shadow-sm"
                >
                  <Heart className="h-4 w-4 text-yellow-deep" /> Chat on WhatsApp
                </a>
                <Link
                  href={user ? "/account" : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold shadow-sm"
                >
                  {user ? (
                    <>
                      <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-yellow text-xs font-black text-ink">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          user.name.trim().charAt(0).toUpperCase() || "U"
                        )}
                      </span>
                      My Account
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 text-yellow-deep" /> Sign in / Account
                    </>
                  )}
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
