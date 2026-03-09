export function getPublicBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (envUrl) {
    return /^https?:\/\//i.test(envUrl) ? envUrl : `https://${envUrl}`;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

export function joinPublicUrl(path: string) {
  const baseUrl = getPublicBaseUrl();
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
