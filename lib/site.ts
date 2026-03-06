export function normalizeBaseUrl(value: string) {
  const trimmed = String(value || "").trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getConfiguredSiteUrl() {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL ||
      ""
  );
}

export function resolvePublicBaseUrl(requestUrl?: string) {
  const configured = getConfiguredSiteUrl();
  if (configured) return configured;

  if (!requestUrl) return "";

  try {
    const origin = new URL(requestUrl).origin;
    return origin;
  } catch {
    return "";
  }
}
