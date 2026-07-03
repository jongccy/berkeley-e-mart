import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { VerifyBanner } from "@/components/VerifyBanner";
import { SITE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "Calket is a marketplace for UC Berkeley students to buy and sell items, services, and housing leases.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
      >
        <Nav />
        <VerifyBanner user={user} />
        <main className="flex-1">{children}</main>
        <footer className="space-y-2 bg-[#003262] py-6 text-center text-xs text-white/90">
          <p>
            {SITE_NAME} — Buy and Sell with verified Berkeley affiliates.
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link
              href="/terms"
              className="text-[#FDB515] underline hover:text-[#ffe08a]"
            >
              Terms of Service
            </Link>
            <span className="text-white/50" aria-hidden>
              ·
            </span>
            <Link
              href="/privacy"
              className="text-[#FDB515] underline hover:text-[#ffe08a]"
            >
              Privacy Policy
            </Link>
          </p>
        </footer>
        <ScrollToTopButton />
      </body>
    </html>
  );
}
