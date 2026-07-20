import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#f0f0f0] px-4 py-8 dark:bg-zinc-900">
      {children}
    </div>
  );
}
