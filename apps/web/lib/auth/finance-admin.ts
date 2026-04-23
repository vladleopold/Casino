const DEFAULT_FINANCE_SUPER_ADMIN_EMAIL = "vladyslavchaplygin@gmail.com";
const AUTH_API_URL = process.env.AUTH_API_URL?.trim().replace(/\/$/, "");
const AUTH_SERVICE_API_KEY = process.env.AUTH_SERVICE_API_KEY?.trim();

export interface FinanceAdminUser {
  adminId: string;
  email: string;
  role: "super_admin" | "admin";
  status: "active";
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getFallbackAdmins(): FinanceAdminUser[] {
  const raw = process.env.FINANCE_ADMIN_EMAILS?.trim();
  const emails = raw
    ? raw
        .split(",")
        .map((value) => normalizeEmail(value))
        .filter(Boolean)
    : [DEFAULT_FINANCE_SUPER_ADMIN_EMAIL];

  return Array.from(new Set(emails)).map((email, index) => ({
    adminId: `fallback_${index + 1}`,
    email,
    role: (email === DEFAULT_FINANCE_SUPER_ADMIN_EMAIL ? "super_admin" : "admin") as
      | "super_admin"
      | "admin",
    status: "active" as const,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    createdBy: "system"
  }));
}

async function authAdminRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    body?: Record<string, unknown>;
  } = {}
) {
  if (!AUTH_API_URL) {
    throw new Error("AUTH_API_URL is not configured.");
  }

  const headers: Record<string, string> = {};

  if (AUTH_SERVICE_API_KEY) {
    headers["x-auth-service-key"] = AUTH_SERVICE_API_KEY;
  }

  if (options.body) {
    headers["content-type"] = "application/json";
  }

  const response = await fetch(`${AUTH_API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        ok?: boolean;
        error?: string;
        message?: string;
      }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? payload?.error ?? "Finance admin request failed.");
  }

  return payload as T;
}

export async function listFinanceAdminUsers() {
  if (!AUTH_API_URL) {
    return getFallbackAdmins();
  }

  try {
    const payload = await authAdminRequest<{ admins?: FinanceAdminUser[] }>("/finance-admin-users");
    return payload.admins?.length ? payload.admins : getFallbackAdmins();
  } catch {
    return getFallbackAdmins();
  }
}

export async function getFinanceAdminUserByEmail(email?: string | null) {
  if (!email) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);

  if (!AUTH_API_URL) {
    return getFallbackAdmins().find((admin) => admin.email === normalizedEmail) ?? null;
  }

  try {
    const payload = await authAdminRequest<{ admin?: FinanceAdminUser | null }>(
      `/finance-admin-users/by-email/${encodeURIComponent(normalizedEmail)}`
    );

    return payload.admin ?? null;
  } catch {
    return getFallbackAdmins().find((admin) => admin.email === normalizedEmail) ?? null;
  }
}

export async function hasFinanceAdminAccess(email?: string | null) {
  const admin = await getFinanceAdminUserByEmail(email);
  return Boolean(admin);
}

export async function addFinanceAdminUser(input: {
  email: string;
  role?: FinanceAdminUser["role"];
  createdBy?: string | null;
}) {
  const payload = await authAdminRequest<{ admin?: FinanceAdminUser | null }>("/finance-admin-users", {
    method: "POST",
    body: {
      email: normalizeEmail(input.email),
      role: input.role ?? "admin",
      createdBy: input.createdBy ?? null
    }
  });

  if (!payload.admin) {
    throw new Error("Finance admin user was not returned.");
  }

  return payload.admin;
}

export async function removeFinanceAdminUser(input: {
  email: string;
  removedBy?: string | null;
}) {
  await authAdminRequest("/finance-admin-users", {
    method: "DELETE",
    body: {
      email: normalizeEmail(input.email),
      removedBy: input.removedBy ?? null
    }
  });
}
