import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export function ProductGrid({
  products,
  columns = 4,
}: {
  products: Product[];
  columns?: 2 | 3 | 4;
}) {
  const cols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  }[columns];

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-cream p-10 text-center text-muted">
        No products found.
      </div>
    );
  }

  return (
    <Stagger className={cn("grid gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10", cols)}>
      {products.map((p) => (
        <StaggerItem key={p.id} className="h-full">
          <ProductCard product={p} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
