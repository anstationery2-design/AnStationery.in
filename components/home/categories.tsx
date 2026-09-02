import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/ui/motion";

const ACCENT_BG: Record<string, string> = {
  "pastel-pink": "bg-pastel-pink",
  "pastel-mint": "bg-pastel-mint",
  "pastel-lilac": "bg-pastel-lilac",
  "pastel-peach": "bg-pastel-peach",
  "pastel-sky": "bg-pastel-sky",
};

type CategoryCard = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  accent?: string | null;
  count: number;
};

export function Categories({ cards }: { cards: CategoryCard[] }) {
  return (
    <section className="mx-auto w-[92%] max-w-[1400px] px-0 py-12 md:py-24">
      <div className="mb-10 text-center md:mb-14">
        <p className="font-accent text-2xl font-bold text-primary-hover md:text-3xl">
          find your vibe
        </p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
          Shop by <span className="text-primary-hover">Category</span>
        </h2>
        <p className="mt-3 text-sm text-muted md:text-base">
          Curated collections for every mood &amp; moment
        </p>
      </div>

      {/* 2 columns on mobile → 3 large cards per row on desktop */}
      <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {cards.map((c) => (
          <StaggerItem key={`${c.id}-${c.slug}`} className="h-full">
            <Link
              href={
                c.slug === "shop"
                  ? "/shop"
                  : c.slug === "trending"
                    ? "/trending"
                    : c.slug === "new"
                      ? "/new"
                      : `/category/${c.slug}`
              }
              className="group relative flex h-full min-h-[190px] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-line/60 bg-white px-6 py-8 text-center shadow-[0_1px_2px_rgba(20,32,28,0.04),0_8px_24px_-12px_rgba(20,32,28,0.18)] transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/30 hover:shadow-[0_2px_4px_rgba(20,32,28,0.06),0_24px_48px_-16px_rgba(20,32,28,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 md:min-h-[240px]"
            >
              <span
                className={`grid h-16 w-16 place-items-center rounded-2xl text-3xl shadow-sm transition-transform duration-300 ease-out group-hover:-rotate-3 group-hover:scale-110 md:h-20 md:w-20 md:text-4xl ${ACCENT_BG[c.accent ?? "pastel-sky"]}`}
              >
                {c.emoji}
              </span>
              <span className="font-display text-base font-bold md:text-xl">
                {c.name}
              </span>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-muted ring-1 ring-inset ring-line/30 md:text-sm">
                {c.count} items
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
