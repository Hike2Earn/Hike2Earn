import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { WalletProvider } from "@/components/wallet-provider";
import { DashboardHeader } from "@/components/dashboard-header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hike2Earn - Web3 Hiking Platform",
  description:
    "Move-to-Earn dApp for hikers. Track hikes, earn HIKE tokens, and join the hiking community on Flare Network.",
  keywords: [
    "Web3",
    "Hiking",
    "Move-to-Earn",
    "Flare Network",
    "HIKE tokens",
    "dApp",
  ],
  authors: [{ name: "Hike2Earn Team" }],
  openGraph: {
    title: "Hike2Earn - Web3 Hiking Platform",
    description: "Move-to-Earn dApp for hikers on Flare Network",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${inter.variable} ${jetbrainsMono.variable} ${dmSans.variable} antialiased`}
      >
        <WalletProvider>
          <DashboardHeader />
          <Suspense fallback={null}>{children}</Suspense>
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  );
}
