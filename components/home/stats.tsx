import { STATS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 rounded-3xl bg-cream p-6 sm:grid-cols-4 sm:p-8">
        <Stagger className="contents">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <Card className="h-full border-0 bg-transparent text-center shadow-none transition-transform duration-300 hover:-translate-y-1">
                <CardContent className="p-2">
                  <div className="text-3xl">{s.emoji}</div>
                  <div className="mt-1 font-display text-3xl font-black text-ink sm:text-4xl">
                    {s.value}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {s.label}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
