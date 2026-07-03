"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toggleListingLike } from "@/app/actions/listing-likes";

type Props = {
  listingId: string;
  initialLiked: boolean;
  loggedIn: boolean;
  loginRedirect?: string;
  size?: "sm" | "md";
  variant?: "overlay" | "inline";
  className?: string;
};

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-full w-full"
        aria-hidden
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-full w-full"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

export function ListingLikeButton({
  listingId,
  initialLiked,
  loggedIn,
  loginRedirect,
  size = "md",
  variant = "overlay",
  className = "",
}: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClass =
    variant === "inline"
      ? size === "sm"
        ? "h-7 w-7"
        : "h-8 w-8"
      : size === "sm"
        ? "h-8 w-8"
        : "h-10 w-10";
  const iconClass =
    variant === "inline"
      ? size === "sm"
        ? "h-6 w-6"
        : "h-7 w-7"
      : size === "sm"
        ? "h-4 w-4"
        : "h-5 w-5";
  const baseClass =
    variant === "inline"
      ? `${sizeClass} flex shrink-0 items-center justify-center transition`
      : `${sizeClass} flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900`;
  const visibilityClass =
    variant === "inline"
      ? liked
        ? "opacity-100"
        : "pointer-events-none opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100"
      : "";

  if (!loggedIn) {
    const redirect = loginRedirect ?? `/listings/${listingId}`;
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(redirect)}`}
        className={`${baseClass} ${visibilityClass} text-zinc-500 hover:text-red-500 ${className}`}
        aria-label="Log in to save listing"
        onClick={(e) => e.stopPropagation()}
      >
        <span className={iconClass}>
          <HeartIcon filled={false} />
        </span>
      </Link>
    );
  }

  async function handleToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (pending) return;

    setPending(true);
    setError(null);
    const nextLiked = !liked;
    setLiked(nextLiked);

    const result = await toggleListingLike(listingId);
    setPending(false);

    if (result.error) {
      setLiked(!nextLiked);
      setError(result.error);
      return;
    }

    setLiked(result.liked);
    router.refresh();
  }

  return (
    <div className={`relative ${visibilityClass} ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className={`${baseClass} ${
          liked ? "text-red-500" : "text-zinc-500 hover:text-red-500"
        } disabled:opacity-50`}
        aria-label={liked ? "Remove from saved listings" : "Save listing"}
        aria-pressed={liked}
      >
        <span className={iconClass}>
          <HeartIcon filled={liked} />
        </span>
      </button>
      {error && (
        <p
          role="alert"
          className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg bg-red-50 px-2 py-1 text-xs text-red-800 shadow dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      )}
    </div>
  );
}
