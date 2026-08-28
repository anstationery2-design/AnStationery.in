import Link from "next/link";

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
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="font-accent text-2xl font-bold text-yellow-deep">
          find your vibe
        </p>
        <h2 className="mt-1 font-display text-3xl font-black tracking-tight sm:text-4xl">
          Shop by <span className="text-yellow-deep">Category</span>
        </h2>
        <p className="mt-2 text-sm text-muted">
          Curated collections for every mood & moment
        </p>
      </div>

      {/* 4 columns → two equal rows of 4 on tablet/desktop */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {cards.map((c) => (
          <Link
            key={`${c.id}-${c.slug}`}
            href={c.slug === "shop" ? "/shop" : `/${c.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-4 py-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <span
              className={`grid h-16 w-16 place-items-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110 ${ACCENT_BG[c.accent ?? "pastel-sky"]}`}
            >
              {c.emoji}
            </span>
            <span className="font-display text-sm font-bold sm:text-base">
              {c.name}
            </span>
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-muted">
              {c.count} items
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
