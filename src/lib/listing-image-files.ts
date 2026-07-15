export function isHeicFile(file: File | Blob, fileName = ""): boolean {
  const type = (file.type || "").toLowerCase();
  const name = fileName.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export function isHeicUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".heic") || path.endsWith(".heif");
  } catch {
    return /\.hei[cf](\?|$)/i.test(url);
  }
}

const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.82;
const SKIP_COMPRESS_UNDER_BYTES = 900_000;

async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }
  if (file.size <= SKIP_COMPRESS_UNDER_BYTES) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  if (!blob) return file;

  const baseName =
    file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/** Convert iPhone HEIC/HEIF photos to JPEG so browsers can display them. */
export async function prepareListingImageFile(file: File): Promise<File> {
  let next = file;

  if (isHeicFile(file, file.name)) {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.85,
    });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    if (!(blob instanceof Blob)) {
      throw new Error("Could not convert this HEIC photo. Try exporting as JPG.");
    }

    const baseName = file.name.replace(/\.hei[cf]$/i, "") || "photo";
    next = new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  }

  return compressImageFile(next);
}

export async function convertHeicUrlToObjectUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not load photo.");
  }
  const source = await response.blob();
  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({
    blob: source,
    toType: "image/jpeg",
    quality: 0.85,
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  if (!(blob instanceof Blob)) {
    throw new Error("Could not convert this HEIC photo.");
  }
  return URL.createObjectURL(blob);
}
