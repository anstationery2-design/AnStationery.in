import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/components/ui/motion";

type ReviewItem = {
  id: string;
  name: string;
  city: string | null;
  rating: number;
  text: string;
  product: string | null;
};

export function Reviews({ reviews }: { reviews: ReviewItem[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="font-accent text-xl font-bold text-primary-hover">
          real smiles
        </p>
        <h2 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
          Loved by Happy Customers
        </h2>
      </div>

      <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reviews.map((r) => (
          <StaggerItem key={r.id}>
            <Card className="tape group flex h-full flex-col gap-3 border-line/60 bg-cream/70 p-5 shadow-[0_1px_2px_rgba(20,32,28,0.04),0_10px_24px_-14px_rgba(20,32,28,0.2)] hover:shadow-[0_2px_4px_rgba(20,32,28,0.05),0_20px_42px_-18px_rgba(20,32,28,0.3)]">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < r.rating ? "fill-yellow text-primary" : "text-line"
                    }`}
                  />
                ))}
              </div>
              <CardContent className="flex-1 p-0">
                <blockquote className="text-sm leading-relaxed text-ink-soft">
                  &ldquo;{r.text}&rdquo;
                </blockquote>
              </CardContent>
              <figcaption className="text-xs">
                <span className="font-bold">{r.name}</span>
                <span className="text-muted"> &middot; {r.city}</span>
              </figcaption>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
