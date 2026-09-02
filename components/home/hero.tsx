import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";

export function Hero({ products: heroProducts }: { products: Product[] }) {
  if (heroProducts.length === 0) return null;

  return (
    <section className="relative h-[calc(100svh_-_104px)] w-full overflow-hidden">
      {/* Full-screen hero image — click to start shopping */}
      <Link
        href="/shop"
        aria-label="Start shopping — view all products"
        className="group relative block h-full w-full"
      >
        <Image
          src="/herosection.png"
          alt="AN Stationery — cute, craft & gift-worthy products"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
        />
      </Link>
    </section>
  );
}
