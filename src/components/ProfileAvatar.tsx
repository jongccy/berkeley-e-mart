import { DEFAULT_AVATAR_URL } from "@/lib/constants";

type Props = {
  avatarUrl: string | null | undefined;
  alt?: string;
  size?: "xs" | "md" | "sm" | "lg";
  className?: string;
};

const sizeClasses = {
  xs: "h-9 w-9",
  md: "h-12 w-12",
  sm: "h-20 w-20",
  lg: "h-32 w-32",
} as const;

export function ProfileAvatar({
  avatarUrl,
  alt = "Profile photo",
  size = "lg",
  className = "",
}: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl || DEFAULT_AVATAR_URL}
      alt={alt}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
    />
  );
}
