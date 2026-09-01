export const SITE = {
  name: "AN Stationery",
  tagline: "Small Things. Big Smiles.",
  description:
    "Discover trending, aesthetic and gift-worthy stationery made to brighten your everyday moments.",
  email: "anstationery2@gmail.com",
  phone: "+91 96996 43557",
  whatsapp: "919699643557",
  instagram: "https://www.instagram.com/crayons2couture/",
  instagramHandle: "@crayons2couture",
  address: "Mumbai, India",
  freeShippingThreshold: 499,
  shippingFee: 49,
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Trending", href: "/trending" },
  { label: "New", href: "/new" },
  { label: "Gifts", href: "/gifts" },
  { label: "About", href: "/about" },
] as const;

export const ANNOUNCEMENTS = [
  "New Drop — 120+ cute products just landed",
  "Free delivery on orders above \u20b9499",
  "New Gift Collection available now",
  "Use code CUTE10 for 10% off your first order",
] as const;

export const STATS = [
  { value: "15K+", label: "Happy Customers", emoji: "\ud83d\udc9d" },
  { value: "120+", label: "Cute Products", emoji: "\u270f\ufe0f" },
  { value: "4.9\u2605", label: "Average Rating", emoji: "\u2b50" },
  { value: "100%", label: "Handpicked", emoji: "\ud83c\udf80" },
] as const;

export const BENEFITS = [
  {
    emoji: "\ud83d\ude9a",
    title: "Express Shipping",
    text: "Free delivery on orders above \u20b9499",
  },
  {
    emoji: "\ud83d\udd04",
    title: "Easy Returns",
    text: "7-day hassle-free return policy",
  },
  {
    emoji: "\u2b50",
    title: "Premium Quality",
    text: "Handpicked aesthetic products",
  },
  {
    emoji: "\ud83d\udcac",
    title: "Reliable Support",
    text: "WhatsApp support available",
  },
] as const;

export const FOOTER_SHOP = [
  { label: "All Products", href: "/shop" },
  { label: "Trending", href: "/trending" },
  { label: "New Arrivals", href: "/new" },
  { label: "Gifts", href: "/gifts" },
] as const;

export const FOOTER_CARE = [
  { label: "Contact", href: "/contact" },
  { label: "Shipping", href: "/contact" },
  { label: "Returns", href: "/contact" },
  { label: "FAQs", href: "/contact" },
] as const;

export const FOOTER_COMPANY = [
  { label: "About Us", href: "/about" },
  { label: "Privacy Policy", href: "/about" },
  { label: "Terms", href: "/about" },
] as const;

/* ---------- admin ---------- */

export const ORDER_STATUSES = [
  "NEW",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export const SHIPMENT_STATUSES = [
  "PENDING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

// Maps a shipment status → the order status customers see.
export const SHIPMENT_TO_ORDER_STATUS: Record<string, string> = {
  PENDING: "CONFIRMED",
  PACKED: "PROCESSING",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const BADGES = [
  "NEW",
  "SALE",
  "HOT",
  "TRENDING",
  "BESTSELLER",
  "SOLD OUT",
] as const;

export const BANNER_VARIANTS = ["green", "cream", "photo", "pastel"] as const;

export const CATEGORY_ACCENTS = [
  "pastel-pink",
  "pastel-mint",
  "pastel-lilac",
  "pastel-peach",
  "pastel-sky",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-pastel-sky text-ink",
  CONFIRMED: "bg-primary-soft text-ink",
  PROCESSING: "bg-pastel-peach text-ink",
  SHIPPED: "bg-pastel-mint text-ink",
  OUT_FOR_DELIVERY: "bg-primary-soft text-primary",
  DELIVERED: "bg-badge-new/15 text-badge-new",
  CANCELLED: "bg-badge-sale/15 text-badge-sale",
};

export const SHIPMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-cream text-muted",
  PACKED: "bg-pastel-peach text-ink",
  SHIPPED: "bg-pastel-mint text-ink",
  OUT_FOR_DELIVERY: "bg-primary-soft text-primary",
  DELIVERED: "bg-badge-new/15 text-badge-new",
  CANCELLED: "bg-badge-sale/15 text-badge-sale",
};

// Progress order used to draw the customer-facing tracking timeline.
export const TRACK_STEPS = [
  { key: "NEW", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
] as const;
