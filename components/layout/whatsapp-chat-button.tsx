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
      className="group fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-green-600 text-white shadow-lg transition hover:scale-110 hover:bg-green-700"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}