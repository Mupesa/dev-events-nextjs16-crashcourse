// Single source of truth for the remote image hosts this app intends to serve.
// `next.config.ts` turns this list into next/image remote patterns, the Event
// model rejects other hosts at write time, and the render helpers below fall
// back to a local placeholder so one bad record never throws inside next/image.

export const ALLOWED_IMAGE_HOSTS = ["res.cloudinary.com"] as const;

// Local placeholder shown when an event image is missing or points at a host
// next/image is not configured to serve. A `.svg` src renders unoptimized, so
// it needs no remote pattern and no `dangerouslyAllowSVG`.
export const FALLBACK_EVENT_IMAGE = "/images/event-placeholder.svg";

// A renderable src is a local `/public` asset or an http(s) URL on an allowed
// host. Anything else makes next/image throw "Invalid src prop" during render.
export function isRenderableImageSrc(src: unknown): src is string {
  if (typeof src !== "string") return false;

  const value = src.trim();
  if (value === "") return false;

  // Reject protocol-relative URLs (`//host/...`) before the local-path check.
  if (value.startsWith("//")) return false;
  if (value.startsWith("/")) return true;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  return (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(url.hostname);
}

// Guarantee a src next/image can render, so a bad record degrades to the
// placeholder instead of throwing during render.
export function resolveEventImage(src: unknown): string {
  return isRenderableImageSrc(src) ? src : FALLBACK_EVENT_IMAGE;
}
