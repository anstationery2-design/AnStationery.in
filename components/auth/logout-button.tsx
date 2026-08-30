"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className={
        `flex w-full items-center justify-center gap-2 rounded-full border border-badge-sale/30 bg-badge-sale/10 py-3 font-semibold text-badge-sale transition hover:bg-badge-sale hover:text-white ` +
        className
      }
    >
      <LogOut className="h-4 w-4" /> Log out
    </button>
  );
}
