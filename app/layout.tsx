import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./components/Providers";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "DevCRM — System operacyjny dla software house'ów",
    template: "%s | DevCRM",
  },
  description:
    "Zintegrowany CRM i system operacyjny dla małych software house'ów i agencji developerskich. Zarządzaj leadami, projektami, kosztami i revenue w jednym panelu.",
  keywords: [
    "CRM",
    "software house",
    "agencja",
    "zarządzanie projektami",
    "leady",
    "kanban",
    "revenue",
  ],
  authors: [{ name: "KPZ Productions" }],
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-[#09090b] text-[#fafafa] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
