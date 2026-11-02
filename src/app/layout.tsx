import { Signature } from "@/components/layout";
import { SITE_NAME, SITE_URL } from "@/data";
import { RESUME_GATE_SCRIPT } from "@/lib";
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const title = `${SITE_NAME} | Play solo or with a friend`;
const description =
  "Take on a computer that blocks your lines and plays to win, or pass the board to a friend. Scores and the game in progress survive a refresh.";

const shareImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "A tic tac toe board mid-game, above the running score for both players and the ties.",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="relative flex min-h-dvh flex-col">
        <script dangerouslySetInnerHTML={{ __html: RESUME_GATE_SCRIPT }} />
        {children}
        <Signature />
      </body>
    </html>
  );
}
