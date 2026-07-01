import Image from "next/image";
import Link from "next/link";
import { SITE_LOGO_PATH, SITE_NAME } from "@/lib/constants";

type Props = {
  href?: string | false;
  className?: string;
  height?: number;
  rounded?: string;
};

export function CalketLogo({
  href = "/",
  className = "",
  height = 36,
  rounded,
}: Props) {
  const logo = (
    <div
      className={`inline-flex shrink-0 overflow-hidden ${rounded ?? ""} ${className}`}
    >
      <Image
        src={SITE_LOGO_PATH}
        alt={SITE_NAME}
        width={Math.round(height * 2.8)}
        height={height}
        className="h-auto w-auto object-contain"
        style={{ height, width: "auto" }}
        priority
      />
    </div>
  );

  if (href === false) return logo;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {logo}
    </Link>
  );
}
