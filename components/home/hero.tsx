import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";

export function Hero({ products: heroProducts }: { products: Product[] }) {
  if (heroProducts.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Full-screen-width hero image — height matches image ratio so nothing spawns off-screen */}
      <Link
        href="/shop"
        aria-label="Start shopping — view all products"
        className="group relative block aspect-[1983/793] w-full max-h-[calc(100svh_-_104px)]"
      >
        <Image
          src="/herosection.png"
          alt="A&N Stationery — cute, craft & gift-worthy products"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
        />
      </Link>
    </section>
  );
}
