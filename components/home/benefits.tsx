import { BENEFITS } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export function Benefits() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {BENEFITS.map((b) => (
          <StaggerItem key={b.title}>
            <Card className="group flex h-full flex-col items-center gap-2 p-6 text-center shadow-[0_1px_2px_rgba(20,32,28,0.04),0_10px_28px_-14px_rgba(20,32,28,0.22)] hover:shadow-[0_2px_4px_rgba(20,32,28,0.05),0_22px_46px_-18px_rgba(20,32,28,0.34)]">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cream text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                {b.emoji}
              </span>
              <CardHeader className="p-0">
                <CardTitle className="text-center font-display text-sm font-bold sm:text-base">
                  {b.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-center text-xs text-muted sm:text-sm">
                  {b.text}
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
