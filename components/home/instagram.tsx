import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import { instagramImages } from "@/lib/dummy-data";
import { SITE } from "@/lib/constants";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export function InstagramSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center gap-1 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-pastel-pink to-pastel-lilac">
          <Camera className="h-6 w-6 text-ink" />
        </span>
        <h2 className="mt-2 font-display text-xl font-black">
          {SITE.instagramHandle}
        </h2>
        <p className="text-sm text-muted">
          Follow us for daily cute inspiration
        </p>
      </div>

      <Stagger className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {instagramImages.map((ig) => (
          <StaggerItem key={ig.id}>
            <Link
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-xl bg-cream shadow-[0_1px_3px_rgba(20,32,28,0.08),0_6px_16px_-10px_rgba(20,32,28,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(20,32,28,0.06),0_14px_30px_-12px_rgba(20,32,28,0.3)]"
            >
              <Image
                src={ig.url}
                alt="Instagram post"
                fill
                sizes="(max-width:640px) 33vw, 16vw"
                className="object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 grid place-items-center bg-ink/0 opacity-0 transition group-hover:bg-ink/30 group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
