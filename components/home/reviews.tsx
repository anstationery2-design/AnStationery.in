"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star, BadgeCheck } from "lucide-react";

type ReviewItem = {
  name: string;
  rating: number;
  text: string;
  product: { name: string; image: string; price: string; originalPrice: string };
};

/* Demo testimonials for the homepage carousel (UI placeholder data). */
const REVIEWS: ReviewItem[] = [
  {
    name: "Ritika Pandey",
    rating: 5,
    text: "I received my order and I am so happy & satisfied ❤️❤️. Amazing quality & stuff. Thank you so much 🥰. The packaging was so cute!",
    product: {
      name: "Premium Butterfly Journaling Gift Set",
      image:
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=200&q=80",
      price: "₹929",
      originalPrice: "₹1,499",
    },
  },
  {
    name: "Sonal Rathore",
    rating: 5,
    text: "Thanks a lottt. Really very nice 💚💚. My friend's daughter loved this 😍😍😍. So cute and good quality!",
    product: {
      name: "Capybara Double Sipper Water Bottle 580ML",
      image:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=200&q=80",
      price: "₹379",
      originalPrice: "₹699",
    },
  },
  {
    name: "Bhumika Sharma",
    rating: 5,
    text: "I received my order and I am so so happy & satisfied ❤️. Amazing quality & stuff. Thank you so much 😍❤️. Package open karte hi I was like Awww so cute!",
    product: {
      name: "Popo Panda Backpack",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80",
      price: "₹1,649",
      originalPrice: "₹2,399",
    },
  },
  {
    name: "Ananya R.",
    rating: 5,
    text: "Absolutely love the products! The floral journal is even prettier in person. Packaging was super cute too. Will be ordering again 💚.",
    product: {
      name: "Aesthetic Floral Journal",
      image:
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80",
      price: "₹399",
      originalPrice: "₹499",
    },
  },
  {
    name: "Karthik M.",
    rating: 5,
    text: "Gifted the stationery box to my sister and she was thrilled. Quality is premium and delivery was quick. Highly recommend 🌟.",
    product: {
      name: "Cute Stationery Gift Box",
      image:
        "https://images.unsplash.com/photo-1503676263721-b1a42a1f5f0e?auto=format&fit=crop&w=200&q=80",
      price: "₹549",
      originalPrice: "₹799",
    },
  },
  {
    name: "Sneha P.",
    rating: 5,
    text: "The pastel planner keeps me so organised and it looks adorable on my desk. Worth every rupee 💚💚.",
    product: {
      name: "Pastel Dream Planner",
      image:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=200&q=80",
      price: "₹549",
      originalPrice: "₹699",
    },
  },
  {
    name: "Meera Joshi",
    rating: 5,
    text: "These cute stickers made my laptop look so much happier! Fast shipping and the cutest packaging ever 🥰.",
    product: {
      name: "Kawaii Sticker Pack",
      image:
        "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=200&q=80",
      price: "₹149",
      originalPrice: "₹249",
    },
  },
  {
    name: "Ishita Verma",
    rating: 5,
    text: "Bought this as a gift and it arrived gift-ready with a cute note. My friend absolutely adored it! Thank you A&N Stationery ✨.",
    product: {
      name: "Ready-to-Gift Cute Hamper",
      image:
        "https://images.unsplash.com/photo-1549465221-14a5cb0b3902?auto=format&fit=crop&w=200&q=80",
      price: "₹499",
      originalPrice: "₹799",
    },
  },
];
/* Number of cards visible per viewport (responsive). */
function getPerView() {
  if (typeof window === "undefined") return 3;
  const w = window.innerWidth;
  if (w >= 1200) return 3;
  if (w >= 768) return 2;
  return 1;
}

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <div className="group flex h-full flex-col rounded-[20px] border border-line/60 bg-white p-7 shadow-[0_1px_2px_rgba(20,32,28,0.04),0_10px_28px_-14px_rgba(20,32,28,0.22)] transition-all duration-300 ease-out hover:-translate-y-[5px] hover:border-primary/20 hover:shadow-[0_2px_4px_rgba(20,32,28,0.06),0_24px_48px_-18px_rgba(20,32,28,0.34)] md:p-8">
      {/* Star rating */}
      <div className="flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < review.rating ? "fill-yellow text-primary" : "text-line"
            }`}
          />
        ))}
      </div>

      {/* Customer info */}
      <div className="mt-4 flex items-center gap-2">
        <span className="font-display text-base font-bold text-ink md:text-lg">
          {review.name}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-primary-soft/60 px-2 py-0.5 text-xs font-semibold text-primary">
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified Buyer
        </span>
      </div>

      {/* Review text */}
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft md:text-base">
        &ldquo;{review.text}&rdquo;
      </blockquote>

      {/* Divider */}
      <div className="my-5 h-px w-full bg-line/20" />

      {/* Product summary */}
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line/40 shadow-sm">
          <Image
            src={review.product.image}
            alt={review.product.name}
            fill
            sizes="64px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-[15px] font-bold leading-snug text-ink">
            {review.product.name}
          </p>
          <p className="mt-1 flex items-center gap-2">
            <span className="font-display text-sm font-black text-primary">
              {review.product.price}
            </span>
            <span className="text-xs font-medium text-muted line-through">
              {review.product.originalPrice}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
export function Reviews() {
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const compute = () => setPerView(getPerView());
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const safePerView = Math.min(perView, REVIEWS.length);
  const maxIndex = Math.max(0, REVIEWS.length - safePerView);

  // Reset index if it goes out of range after a resize.
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  // Auto-scroll every 3.5s, pausing while hovered/focused.
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setIndex((i) => (i >= maxIndex ? 0 : i + 1));
      }
    }, 3500);
    return () => clearInterval(id);
  }, [maxIndex]);

  const trackStyle = {
    transform: `translateX(-${index * (100 / safePerView)}%)`,
    transition: "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <section className="w-full bg-background">
      <div className="mx-auto w-[92%] max-w-[1400px] px-0 py-[80px] md:py-24">
        {/* Heading */}
        <div className="mb-[45px] text-center">
          <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            <span className="mr-1"></span>Loved by Thousands of Happy Customers
          </h2>
          <p className="mt-3 text-sm text-muted md:text-base">
            Real love from real customers. <span className="align-middle">✨</span>
          </p>
        </div>

        {/* Carousel */}
        <div
          role="region"
          aria-label="Customer reviews carousel"
          className="overflow-hidden"
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          onFocus={() => (pausedRef.current = true)}
          onBlur={() => (pausedRef.current = false)}
        >
          <div className="flex" style={trackStyle}>
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="px-2 md:px-3"
                style={{
                  width: `${100 / safePerView}%`,
                  flex: `0 0 ${100 / safePerView}%`,
                }}
              >
                <ReviewCard review={r} />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots */}
        <div
          className="mt-[35px] flex items-center justify-center gap-2.5"
          role="tablist"
          aria-label="Choose review slide"
        >
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show review slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                i === index
                  ? "w-7 bg-primary"
                  : "w-2.5 bg-line/40 hover:bg-line/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
