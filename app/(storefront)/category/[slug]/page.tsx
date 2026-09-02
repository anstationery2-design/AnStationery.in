import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop by Category | A&N Stationery",
  description: "Browse cute stationery and gifts by category.",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug),
  ]);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 text-center">
        <p className="font-accent text-xl font-bold text-primary-hover">
          {category.description}
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          {category.name} {category.emoji}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {products.length} {products.length === 1 ? "product" : "products"} in
          this collection
        </p>
      </header>
      <ProductGrid products={products} />
    </div>
  );
}