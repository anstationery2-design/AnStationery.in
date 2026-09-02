import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/motion";

const VARIANT_BG: Record<string, string> = {
  green: "bg-primary text-white",
  cream: "bg-cream-deep text-ink",
  photo: "bg-ink text-white",
  pastel: "bg-pastel-lilac text-ink",
};

const Doodles = ["\u2728", "\ud83c\udf81", "\u2b50", "\ud83c\udf80", "\u270f\ufe0f"];

type BannerItem = {
  id: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  variant: string;
};

export function PromoBanners({ banners }: { banners: BannerItem[] }) {
  const items = banners.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Reveal className="grid gap-4 md:grid-cols-3" delay={0}>
        {items.map((b, i) => (
          <Reveal key={b.id} delay={i * 0.1}>
            <Link
              href={b.buttonUrl ?? "/shop"}
              className={cn(
                "tape group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-[0_1px_2px_rgba(20,32,28,0.08),0_10px_28px_-12px_rgba(20,32,28,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(20,32,28,0.08),0_22px_46px_-16px_rgba(20,32,28,0.5)] min-h-[180px]",
                VARIANT_BG[b.variant] ?? VARIANT_BG.green,
              )}
            >
            <span className="pointer-events-none absolute -right-4 -top-4 text-7xl opacity-20 transition group-hover:scale-110">
              {Doodles[i % Doodles.length]}
            </span>
            <span className="pointer-events-none absolute bottom-3 left-4 text-2xl opacity-40">
              {Doodles[(i + 2) % Doodles.length]}
            </span>

            <div className="relative">
              <p className="font-accent text-xl font-bold opacity-80">
                {b.subtitle ?? ""}
              </p>
              <h3 className="mt-1 font-display text-2xl font-black leading-tight">
                {b.title}
              </h3>
            </div>

            <span className="relative mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-white/80 px-4 py-2 text-sm font-bold transition group-hover:gap-2.5">
              {b.buttonText ?? "Shop Now"}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          </Reveal>
        ))}
      </Reveal>
    </section>
  );
}
