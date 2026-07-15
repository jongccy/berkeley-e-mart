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

/** Convert iPhone HEIC/HEIF photos to JPEG so browsers can display them. */
export async function prepareListingImageFile(file: File): Promise<File> {
  if (!isHeicFile(file, file.name)) {
    return file;
  }

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
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
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
