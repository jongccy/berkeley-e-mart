"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function useReturnTo(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}
