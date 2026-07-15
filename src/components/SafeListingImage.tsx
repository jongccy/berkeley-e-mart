"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { convertHeicUrlToObjectUrl, isHeicUrl } from "@/lib/listing-image-files";

type Props = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Renders listing photos, converting HEIC/HEIF (iPhone) to JPEG in the browser
 * when needed — Chrome/Firefox can't display HEIC natively.
 */
export function SafeListingImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: Props) {
  const needsConvert = isHeicUrl(src);
  const [displaySrc, setDisplaySrc] = useState(needsConvert ? "" : src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!needsConvert) {
      setDisplaySrc(src);
      setFailed(false);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    setDisplaySrc("");
    setFailed(false);

    convertHeicUrlToObjectUrl(src)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setDisplaySrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, needsConvert]);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-200 text-xs text-zinc-500 dark:bg-zinc-800 ${className ?? ""}`}
        style={fill ? { position: "absolute", inset: 0 } : undefined}
      >
        Photo unavailable
      </div>
    );
  }

  if (!displaySrc) {
    return (
      <div
        className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 ${className ?? ""}`}
        style={fill ? { position: "absolute", inset: 0 } : undefined}
        aria-label="Loading photo"
      />
    );
  }

  // Blob URLs and converted HEIC can't go through the Next image optimizer.
  if (needsConvert || displaySrc.startsWith("blob:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={displaySrc}
        alt={alt}
        className={className}
        style={
          fill
            ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
            : undefined
        }
        width={fill ? undefined : width}
        height={fill ? undefined : height}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={displaySrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={displaySrc}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
