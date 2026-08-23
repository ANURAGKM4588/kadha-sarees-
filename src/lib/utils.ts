import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  let clean = path;
  try {
    clean = decodeURIComponent(clean);
  } catch {}
  clean = clean.replace(/^(\.\/|\/)+/, "");

  const baseUrl = import.meta.env.BASE_URL || "/";
  const prefix = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${prefix}${clean}`;
}

export const getPublicUrl = resolveAssetUrl;
