import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/products/product-grid";
import type { Product } from "@/types";

export function ProductSection({
  eyebrow,
  title,
  subtitle,
  products,
  viewAllHref,
  accent = "text-primary-hover",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  accent?: string;
}) {
  return (
    <section className="mx-auto w-[92%] max-w-[1400px] px-0 py-10 md:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          {eyebrow && (
            <p className={`font-accent text-xl font-bold md:text-2xl ${accent}`}>
              {eyebrow}
            </p>
          )}
          <h2 className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-sm text-muted md:text-base">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group flex shrink-0 items-center gap-1 rounded-full border border-line px-5 py-2.5 text-sm font-semibold transition hover:border-ink hover:bg-ink hover:text-white"
          >
            View All
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
