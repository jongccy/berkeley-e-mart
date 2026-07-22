import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { Nav } from "@/components/Nav";
import { MessagingProvider } from "@/components/messaging/MessagingProvider";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { SiteStructuredData } from "@/components/SiteStructuredData";
import { VerifyBanner } from "@/components/VerifyBanner";
import { CANONICAL_SITE_URL } from "@/lib/auth";
import { SITE_LOGO_PATH, SITE_NAME } from "@/lib/constants";
import { geistPixel, nunito } from "@/lib/fonts";
import { getUnreadInboxCount } from "@/lib/inbox-unread";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const SITE_DESCRIPTION =
  "Calket is a marketplace for UC Berkeley students to buy and sell items, services, and housing leases.";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_URL),
  title: {
    default: `${SITE_NAME} | Berkeley Student Marketplace`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: CANONICAL_SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Berkeley Student Marketplace`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_LOGO_PATH,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Berkeley Student Marketplace`,
    description: SITE_DESCRIPTION,
    images: [SITE_LOGO_PATH],
  },
  robots: {
    index: true,
    follow: true,
  },
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

  let initialUnreadCount = 0;
  if (user) {
    initialUnreadCount = await getUnreadInboxCount(supabase);
  }

  const shell = (
    <>
      <Nav />
      <VerifyBanner user={user} />
      <main className="flex-1">{children}</main>
      <footer className="space-y-2 border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-600">
        <p>
          {SITE_NAME} · A marketplace for Cal, by Cal · Go Bears! 🐻
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link
            href="/terms"
            className="font-medium text-[#003262] underline hover:text-[#002244]"
          >
            Terms of Service
          </Link>
          <span className="text-zinc-300" aria-hidden>
            ·
          </span>
          <Link
            href="/privacy"
            className="font-medium text-[#003262] underline hover:text-[#002244]"
          >
            Privacy Policy
          </Link>
        </p>
      </footer>
      <ScrollToTopButton />
    </>
  );

  return (
    <html
      lang="en"
      className={`${nunito.variable} ${geistPixel.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className={`${nunito.className} flex min-h-full flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100`}
      >
        <SiteStructuredData />
        {user ? (
          <MessagingProvider
            userId={user.id}
            initialUnreadCount={initialUnreadCount}
          >
            {shell}
          </MessagingProvider>
        ) : (
          shell
        )}
        <Analytics />
      </body>
    </html>
  );
}
