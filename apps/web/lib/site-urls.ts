const DEFAULT_PUBLIC_SITE_URL = "https://web-iota-neon-58.vercel.app";
const DEFAULT_FINANCE_OPS_URL = "https://casino-ops.vercel.app";

function normalizeAbsoluteUrl(value: string | undefined, fallback: string) {
  const candidate = value?.trim();

  if (!candidate) {
    return fallback;
  }

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export function getPublicSiteUrl() {
  return normalizeAbsoluteUrl(process.env.PUBLIC_SITE_URL, DEFAULT_PUBLIC_SITE_URL);
}

export function getFinanceOpsUrl() {
  return normalizeAbsoluteUrl(process.env.FINANCE_OPS_URL, DEFAULT_FINANCE_OPS_URL);
}

export function sanitizeRelativePath(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
