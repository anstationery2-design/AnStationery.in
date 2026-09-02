import { Hero } from "@/components/home/hero";
import { PromoBanners } from "@/components/home/promo-banners";
import { Stats } from "@/components/home/stats";
import { GiftFeature } from "@/components/home/gift-feature";
import { Benefits } from "@/components/home/benefits";
import { Reviews } from "@/components/home/reviews";
import { InstagramSection } from "@/components/home/instagram";
import { ProductSection } from "@/components/products/product-section";
import { WhatsAppChatButton } from "@/components/layout/whatsapp-chat-button";
import {
  getActiveBanners,
  getAllProducts,
  getBestSellers,
  getFeatured,
  getNewArrivals,
  getPerfectGifts,
  getTrending,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [trending, bestSellers, newArrivals, freshDrops, gift, banners, allProducts] =
    await Promise.all([
      getTrending(),
      getBestSellers(),
      getNewArrivals(),
      getFeatured(),
      getPerfectGifts(),
      getActiveBanners(),
      getAllProducts(),
    ]);

  return (
    <>
      <Hero products={allProducts.slice(0, 3)} />
      <PromoBanners banners={banners} />

      <ProductSection
        eyebrow="trending right now"
        title="Trending Right Now"
        subtitle="What everyone is loving this week"
        products={trending.slice(0, 4)}
        viewAllHref="/trending"
      />

      <GiftFeature product={gift[0]} />

      <ProductSection
        eyebrow="fan favourites"
        title="Best Sellers"
        subtitle="Tried, tested & totally adored"
        products={bestSellers.slice(0, 4)}
        viewAllHref="/shop"
      />

      <ProductSection
        eyebrow="fresh in store"
        title="New Arrivals"
        subtitle="Just landed & waiting for you"
        products={newArrivals.slice(0, 4)}
        viewAllHref="/new"
      />

      <Stats />

      <ProductSection
        eyebrow="handpicked for you"
        title="Fresh Drops"
        subtitle="Featured picks you can&rsquo;t miss"
        products={freshDrops.slice(0, 4)}
        viewAllHref="/shop"
      />

      <Reviews />

      <Benefits />
      <InstagramSection />

      {/* WhatsApp chat — home page only */}
      <WhatsAppChatButton />
    </>
  );
}
