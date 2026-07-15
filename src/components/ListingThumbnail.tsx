import { SafeListingImage } from "@/components/SafeListingImage";

type Props = {
  imageUrl: string | null;
  alt: string;
  size?: "xs" | "md";
};

const sizeConfig = {
  xs: { className: "h-12 w-12 rounded-lg", sizes: "48px" },
  md: { className: "h-20 w-20 rounded-lg", sizes: "80px" },
} as const;

export function ListingThumbnail({
  imageUrl,
  alt,
  size = "md",
}: Props) {
  const { className, sizes } = sizeConfig[size];

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800 ${className}`}
    >
      {imageUrl ? (
        <SafeListingImage
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
          No photo
        </div>
      )}
    </div>
  );
}
