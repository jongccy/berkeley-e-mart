import Link from "next/link";
import { DisplayNameWithBadge } from "@/components/DisplayNameWithBadge";
import { formatPrice, formatCategory } from "@/lib/format";
import {
  profileIsVerified,
  resolvePublicName,
  type ProfilePublicIdentity,
} from "@/lib/profile-display";
import type { WantedPost } from "@/types/database";

export type HomeRequestPost = WantedPost & {
  profiles: ProfilePublicIdentity | null;
};

type Props = {
  post: HomeRequestPost;
};

export function HomeRequestCard({ post }: Props) {
  const requesterName = resolvePublicName(post.profiles);

  return (
    <Link
      href={`/wanted/${post.id}`}
      className="group flex h-full flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 transition hover:border-[#003262]/25 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <span className="w-fit rounded-full bg-[#003262]/8 px-2.5 py-0.5 text-xs font-medium text-[#003262] dark:bg-[#FDB515]/15 dark:text-[#FDB515]">
        {formatCategory(post.category)}
      </span>
      <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-zinc-900 transition group-hover:text-[#003262] dark:text-zinc-50 dark:group-hover:text-[#FDB515]">
        {post.title}
      </h3>
      <p className="mt-1 text-xs text-zinc-500">
        <DisplayNameWithBadge
          name={requesterName}
          verified={profileIsVerified(post.profiles)}
        />
      </p>
      {post.description?.trim() && (
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
          {post.description}
        </p>
      )}
      <p className="mt-4 text-sm font-bold text-[#003262] dark:text-[#FDB515]">
        Max: {formatPrice(post.max_price_cents)}
      </p>
    </Link>
  );
}
