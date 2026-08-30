import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/constants";

export function WhatsAppChatButton() {
  const message = encodeURIComponent(
    "Hi AN Stationery! I have a question about your products.",
  );
  const waiver = `https://wa.me/${SITE.whatsapp}?text=${message}`;

  return (
    <a
      href={waiver}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-30 flex items-center gap-3 rounded-full bg-pastel-mint py-3 pl-4 pr-5 shadow-lg transition hover:scale-105 hover:bg-mint"
      aria-label="Chat on WhatsApp"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-600 text-white shadow">
        <MessageCircle className="h-5 w-5" />
      </span>
      <span className="hidden flex-col text-left sm:flex">
        <span className="text-sm font-bold text-ink">Chat with us</span>
        <span className="text-xs text-muted">We usually reply in minutes</span>
      </span>
    </a>
  );
}