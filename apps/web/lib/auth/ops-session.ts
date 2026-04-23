import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { getFinanceAdminUserByEmail, type FinanceAdminUser } from "./finance-admin";

const OPS_SESSION_COOKIE = "slotcity_ops_session";
const OPS_SESSION_LIFETIME_SECONDS = 60 * 60 * 12;
const OPS_BRIDGE_LIFETIME_SECONDS = 60 * 5;

type OpsTokenKind = "bridge" | "session";

type OpsTokenPayload = {
  kind: OpsTokenKind;
  sub: string;
  email: string;
  role: "super_admin" | "admin";
  iat: number;
  exp: number;
};

export type OpsAdminSession = {
  adminId: string;
  email: string;
  role: "super_admin" | "admin";
  createdAt: string;
};

function getOpsSecret() {
  const secret = process.env.AUTH_SECRET?.trim();

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return secret;
}

function signPayload(payload: string) {
  return createHmac("sha256", getOpsSecret()).update(payload).digest("base64url");
}

function encodeToken(payload: OpsTokenPayload) {
  const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(serialized);
  return `${serialized}.${signature}`;
}

function decodeToken(token: string, expectedKind: OpsTokenKind) {
  const [serialized, signature] = token.split(".");

  if (!serialized || !signature) {
    return null;
  }

  const expectedSignature = signPayload(serialized);
  const left = Buffer.from(signature);
  const right = Buffer.from(expectedSignature);

  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(serialized, "base64url").toString("utf8")
    ) as OpsTokenPayload;

    if (payload.kind !== expectedKind) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function toOpsAdminSession(admin: FinanceAdminUser): OpsAdminSession {
  return {
    adminId: admin.adminId,
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt
  };
}

export function createOpsBridgeToken(admin: FinanceAdminUser) {
  const now = Math.floor(Date.now() / 1000);

  return encodeToken({
    kind: "bridge",
    sub: admin.adminId,
    email: admin.email,
    role: admin.role,
    iat: now,
    exp: now + OPS_BRIDGE_LIFETIME_SECONDS
  });
}

export function createOpsSessionToken(admin: FinanceAdminUser) {
  const now = Math.floor(Date.now() / 1000);

  return encodeToken({
    kind: "session",
    sub: admin.adminId,
    email: admin.email,
    role: admin.role,
    iat: now,
    exp: now + OPS_SESSION_LIFETIME_SECONDS
  });
}

export async function consumeOpsBridgeToken(token: string) {
  const payload = decodeToken(token, "bridge");

  if (!payload) {
    return null;
  }

  const admin = await getFinanceAdminUserByEmail(payload.email);
  return admin ? toOpsAdminSession(admin) : null;
}

async function readOpsSessionToken() {
  const store = await cookies();
  return store.get(OPS_SESSION_COOKIE)?.value ?? null;
}

export async function getOpsAdminSession() {
  const token = await readOpsSessionToken();

  if (!token) {
    return null;
  }

  const payload = decodeToken(token, "session");

  if (!payload) {
    return null;
  }

  const admin = await getFinanceAdminUserByEmail(payload.email);
  return admin ? toOpsAdminSession(admin) : null;
}

export function getOpsSessionCookieName() {
  return OPS_SESSION_COOKIE;
}

export function getOpsSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: OPS_SESSION_LIFETIME_SECONDS
  };
}
