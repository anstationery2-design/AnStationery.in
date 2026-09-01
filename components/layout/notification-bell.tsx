"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Notice = {
  id: string;
  title: string;
  message: string;
  status: string | null;
  type: string;
  order_number: string | null;
  created_at: string;
  is_read: boolean;
};

export function NotificationBell({ email }: { email: string }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);

  const load = () => {
    if (!email) return Promise.resolve({ notifications: [], unread: 0 });
    return fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => ({
        notifications: (data.notifications ?? []) as Notice[],
        unread: (data.unread ?? 0) as number,
      }))
      .catch(() => ({ notifications: [], unread: 0 }));
  };

  useEffect(() => {
    load().then(({ notifications, unread }) => {
      setItems(notifications);
      setUnread(unread);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    if (!email) return;
    const timer = setInterval(() => {
      load().then(({ notifications, unread }) => {
        setItems(notifications);
        setUnread(unread);
      });
    }, 15000);
    const onFocus = () =>
      load().then(({ notifications, unread }) => {
        setItems(notifications);
        setUnread(unread);
      });
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read", { method: "POST" });
      setUnread(0);
    } catch {
      /* ignore */
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) markAllRead();
  };

  const openAccount = () => {
    setOpen(false);
    router.push("/account");
  };

  if (!email) {
    return (
      <Link
        href="/login"
        className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-cream"
        aria-label="Notifications require sign in"
        title="Sign in to see notifications"
      >
        <Bell className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-cream"
        aria-label="Notifications"
      >
        <Bell className={cn("h-5 w-5", unread > 0 && "animate-pop")} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              "absolute right-0 top-full z-50 mt-3 w-80 max-w-[85vw] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl",
            )}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-display text-sm font-black">Notifications</span>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary-hover"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <div className="text-4xl">{"\ud83d\udd15"}</div>
                  <p className="mt-2 text-sm text-muted">No notifications yet</p>
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={openAccount}
                    className="flex w-full items-start gap-3 border-b border-line/60 px-4 py-3 text-left transition hover:bg-cream/60"
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        n.is_read ? "bg-line" : "bg-primary-hover",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold">{n.title}</span>
                        <span className="shrink-0 text-[10px] text-muted">
                          {timeAgo(n.created_at)}
                        </span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-muted">
                        {n.message}
                      </span>
                      {n.order_number && (
                        <span className="mt-1 inline-block rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold text-muted">
                          #{n.order_number}
                        </span>
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>

            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block border-t border-line px-4 py-2.5 text-center text-xs font-semibold text-muted hover:text-primary-hover"
            >
              View your orders {"\u2192"}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
