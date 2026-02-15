import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "OldPairs | OG Token Screener for Solana",
  description:
    "Discover established Solana memecoins. Filter by age, market cap, liquidity, holders, and more. Built for traders who want OG coins with proven track records.",
  keywords: [
    "solana",
    "memecoin",
    "token screener",
    "old pairs",
    "og tokens",
    "defi",
    "pumpfun",
    "raydium",
    "crypto trading",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
