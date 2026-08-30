import type { Metadata } from "next";
import { Caveat, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} \u2014 ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  authors: [
    {
      name: "dev.rohit.jadhav",
      url: "https://www.instagram.com/dev.rohit.jadhav",
    },
  ],
  creator: "dev.rohit.jadhav",
  generator: "AN Stationery by dev.rohit.jadhav",
  robots: { index: true, follow: true },
  keywords: [
    "stationery",
    "gifts",
    "journals",
    "diaries",
    "aesthetic",
    "cute",
    "India",
    "An Stationery",
    "developed by dev.rohit.jadhav",
  ],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-128.png", sizes: "128x128", type: "image/png" },
    ],
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: `${SITE.name} \u2014 ${SITE.tagline}`,
    description: SITE.description,
    type: "website",
    siteName: SITE.name,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://anstationery.in"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AN Stationery",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://anstationery.in",
              author: {
                "@type": "Person",
                name: "dev.rohit.jadhav",
                url: "https://www.instagram.com/dev.rohit.jadhav",
              },
              creator: "dev.rohit.jadhav",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
