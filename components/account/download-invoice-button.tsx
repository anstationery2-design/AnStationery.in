"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export function DownloadInvoiceButton({
  orderNumber,
  className = "",
}: {
  orderNumber: string;
  className?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/orders/${orderNumber}/invoice`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={download}
      disabled={downloading}
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-60 ${className}`}
    >
      <Download className="h-3.5 w-3.5" />
      {downloading ? "Preparing…" : "Invoice (PDF)"}
    </button>
  );
}
