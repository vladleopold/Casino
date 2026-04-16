import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import { Pool } from "pg";

import { syncUserToDirectusMirror } from "./directus-user-mirror";
import {
  createRemoteCredentialUser,
  getRemoteStorefrontUserByEmail,
  getRemoteStorefrontUserById,
  incrementRemoteUserBalance,
  isRemoteAuthConfigured,
  listRemoteStorefrontUsers,
  touchRemoteUserSeen,
  upsertRemoteGoogleUser,
  verifyRemoteCredentialUser
} from "./remote-store-users";

export interface StorefrontUser {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  authProvider: string;
  balance: number;
  status: "active";
  avatarUrl?: string | null;
  googleSubject?: string | null;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  lastSeenAt?: string | null;
}

interface StorefrontUserRow {
  user_id: string;
  email: string;
  username: string;
  display_name: string | null;
  auth_provider: string;
  password_hash: string | null;
  google_subject: string | null;
  balance: number;
  status: "active";
  avatar_url: string | null;
  email_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
  last_seen_at: Date | null;
}

const STORE_DB_URL = process.env.STORE_DB_URL;
const SALT_ROUNDS = 12;

declare global {
  // eslint-disable-next-line no-var
  var __slotcityAuthPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __slotcityAuthSchemaInit: Promise<void> | undefined;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function slugifyUsername(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || `slotcity_${randomUUID().slice(0, 8)}`;
}

function deriveUsernameFromEmail(email: string) {
  return slugifyUsername(email.split("@")[0] || "slotcity_user");
}

function mapUser(row: StorefrontUserRow): StorefrontUser {
  const toIsoString = (value: Date | string | null | undefined) => {
    if (!value) {
      return null;
    }

    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  };

  return {
    userId: row.user_id,
    email: row.email,
    username: row.username,
    displayName: row.display_name || row.username,
    authProvider: row.auth_provider,
    balance: Number(row.balance) || 0,
    status: row.status,
    avatarUrl: row.avatar_url,
    googleSubject: row.google_subject,
    emailVerifiedAt: toIsoString(row.email_verified_at),
    createdAt: toIsoString(row.created_at) || new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) || new Date().toISOString(),
    lastLoginAt: toIsoString(row.last_login_at),
    lastSeenAt: toIsoString(row.last_seen_at)
  };
}

function isUniqueViolation(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
  );
}

function getPool() {
  if (!STORE_DB_URL) {
    throw new Error("STORE_DB_URL is not configured.");
  }

  if (!globalThis.__slotcityAuthPool) {
    globalThis.__slotcityAuthPool = new Pool({
      connectionString: STORE_DB_URL,
      ssl:
        STORE_DB_URL.includes("render.com") || STORE_DB_URL.includes("neon.tech")
          ? { rejectUnauthorized: false }
          : undefined
    });
  }

  return globalThis.__slotcityAuthPool;
}

async function ensureSchema() {
  if (!globalThis.__slotcityAuthSchemaInit) {
    globalThis.__slotcityAuthSchemaInit = (async () => {
      const pool = getPool();

      await pool.query(`
        CREATE TABLE IF NOT EXISTS storefront_auth_users (
          user_id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          username TEXT NOT NULL,
          display_name TEXT,
          auth_provider TEXT NOT NULL DEFAULT 'credentials',
          password_hash TEXT,
          google_subject TEXT UNIQUE,
          balance INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'active',
          avatar_url TEXT,
          email_verified_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_login_at TIMESTAMPTZ,
          last_seen_at TIMESTAMPTZ
        );
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS storefront_auth_users_created_at_idx
          ON storefront_auth_users (created_at DESC);
      `);

      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS storefront_auth_users_google_subject_uidx
          ON storefront_auth_users (google_subject)
          WHERE google_subject IS NOT NULL;
      `);
    })();
  }

  await globalThis.__slotcityAuthSchemaInit;
}

async function syncMirror(user: StorefrontUser) {
  await syncUserToDirectusMirror(user);
}

async function queryUserBySql(query: string, params: unknown[]) {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<StorefrontUserRow>(query, params);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

async function queryRowBySql(query: string, params: unknown[]) {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<StorefrontUserRow>(query, params);
  return result.rows[0] ?? null;
}

export function isStoreAuthConfigured() {
  return Boolean(STORE_DB_URL || isRemoteAuthConfigured());
}

export async function getStorefrontUserById(userId: string) {
  if (!STORE_DB_URL && isRemoteAuthConfigured()) {
    return getRemoteStorefrontUserById(userId);
  }

  return queryUserBySql(
    `
      SELECT *
      FROM storefront_auth_users
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );
}

export async function getStorefrontUserByEmail(email: string) {
  if (!STORE_DB_URL && isRemoteAuthConfigured()) {
    return getRemoteStorefrontUserByEmail(email);
  }

  return queryUserBySql(
    `
      SELECT *
      FROM storefront_auth_users
      WHERE email = $1
      LIMIT 1
    `,
    [normalizeEmail(email)]
  );
}

export async function listStorefrontUsersForAdmin(limit = 100) {
  if (!STORE_DB_URL && isRemoteAuthConfigured()) {
    return listRemoteStorefrontUsers(limit);
  }

  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<StorefrontUserRow>(
    `
      SELECT *
      FROM storefront_auth_users
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows.map(mapUser);
}

export async function createCredentialUser(input: {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
}) {
  if (!STORE_DB_URL && isRemoteAuthConfigured()) {
    return createRemoteCredentialUser(input);
  }

  await ensureSchema();
  const pool = getPool();
  const email = normalizeEmail(input.email);
  const username = slugifyUsername(input.username || deriveUsernameFromEmail(email));
  const displayName = input.displayName?.trim() || username;
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  try {
    const result = await pool.query<StorefrontUserRow>(
      `
        INSERT INTO storefront_auth_users (
          user_id,
          email,
          username,
          display_name,
          auth_provider,
          password_hash,
          created_at,
          updated_at,
          last_login_at,
          last_seen_at
        )
        VALUES ($1, $2, $3, $4, 'credentials', $5, NOW(), NOW(), NOW(), NOW())
        RETURNING *
      `,
      [`sc_${randomUUID().replace(/-/g, "").slice(0, 18)}`, email, username, displayName, passwordHash]
    );

    const user = mapUser(result.rows[0]);
    await syncMirror(user);
    return user;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("Користувач з таким email вже існує.");
    }

    throw error;
  }
}

export async function verifyCredentialUser(input: { email: string; password: string }) {
  if (!STORE_DB_URL && isRemoteAuthConfigured()) {
    return verifyRemoteCredentialUser(input);
  }

  const row = await queryRowBySql(
    `
      SELECT *
      FROM storefront_auth_users
      WHERE email = $1
      LIMIT 1
    `,
    [normalizeEmail(input.email)]
  );

  if (!row?.password_hash) {
    return null;
  }

  const isValid = await bcrypt.compare(input.password, row.password_hash);

  if (!isValid) {
    return null;
  }

  const pool = getPool();
  const updated = await pool.query<StorefrontUserRow>(
    `
      UPDATE storefront_auth_users
      SET last_login_at = NOW(),
          last_seen_at = NOW(),
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `,
    [row.user_id]
  );

  const user = mapUser(updated.rows[0]);
  await syncMirror(user);
  return user;
}

export async function upsertGoogleUser(input: {
  email: string;
  googleSubject: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  emailVerifiedAt?: string | null;
}) {
  if (!STORE_DB_URL && isRemoteAuthConfigured()) {
    return upsertRemoteGoogleUser(input);
  }

  await ensureSchema();
  const pool = getPool();
  const email = normalizeEmail(input.email);
  const displayName = input.displayName?.trim() || deriveUsernameFromEmail(email);
  const avatarUrl = input.avatarUrl?.trim() || null;
  const emailVerifiedAt = input.emailVerifiedAt ?? new Date().toISOString();

  const byGoogle = await queryRowBySql(
    `
      SELECT *
      FROM storefront_auth_users
      WHERE google_subject = $1
      LIMIT 1
    `,
    [input.googleSubject]
  );

  if (byGoogle) {
    const updated = await pool.query<StorefrontUserRow>(
      `
        UPDATE storefront_auth_users
        SET email = $2,
            display_name = $3,
            avatar_url = $4,
            auth_provider = CASE
              WHEN auth_provider = 'credentials' THEN 'credentials+google'
              ELSE auth_provider
            END,
            email_verified_at = COALESCE($5::timestamptz, email_verified_at, NOW()),
            last_login_at = NOW(),
            last_seen_at = NOW(),
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `,
      [byGoogle.user_id, email, displayName, avatarUrl, emailVerifiedAt]
    );

    const user = mapUser(updated.rows[0]);
    await syncMirror(user);
    return user;
  }

  const byEmail = await queryRowBySql(
    `
      SELECT *
      FROM storefront_auth_users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  if (byEmail) {
    const updated = await pool.query<StorefrontUserRow>(
      `
        UPDATE storefront_auth_users
        SET google_subject = $2,
            display_name = COALESCE(display_name, $3),
            avatar_url = COALESCE($4, avatar_url),
            auth_provider = CASE
              WHEN auth_provider = 'credentials' THEN 'credentials+google'
              ELSE 'google'
            END,
            email_verified_at = COALESCE($5::timestamptz, email_verified_at, NOW()),
            last_login_at = NOW(),
            last_seen_at = NOW(),
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `,
      [byEmail.user_id, input.googleSubject, displayName, avatarUrl, emailVerifiedAt]
    );

    const user = mapUser(updated.rows[0]);
    await syncMirror(user);
    return user;
  }

  const inserted = await pool.query<StorefrontUserRow>(
    `
      INSERT INTO storefront_auth_users (
        user_id,
        email,
        username,
        display_name,
        auth_provider,
        google_subject,
        avatar_url,
        email_verified_at,
        created_at,
        updated_at,
        last_login_at,
        last_seen_at
      )
      VALUES ($1, $2, $3, $4, 'google', $5, $6, $7::timestamptz, NOW(), NOW(), NOW(), NOW())
      RETURNING *
    `,
    [
      `sc_${randomUUID().replace(/-/g, "").slice(0, 18)}`,
      email,
      deriveUsernameFromEmail(email),
      displayName,
      input.googleSubject,
      avatarUrl,
      emailVerifiedAt
    ]
  );

  const user = mapUser(inserted.rows[0]);
  await syncMirror(user);
  return user;
}

export async function incrementUserBalance(input: { userId: string; amount: number }) {
  if (!STORE_DB_URL && isRemoteAuthConfigured()) {
    return incrementRemoteUserBalance(input);
  }

  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<StorefrontUserRow>(
    `
      UPDATE storefront_auth_users
      SET balance = balance + $2,
          last_seen_at = NOW(),
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `,
    [input.userId, input.amount]
  );

  if (!result.rows[0]) {
    return null;
  }

  const user = mapUser(result.rows[0]);
  await syncMirror(user);
  return user;
}

export async function touchUserSeen(userId: string) {
  if (!STORE_DB_URL && isRemoteAuthConfigured()) {
    return touchRemoteUserSeen(userId);
  }

  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<StorefrontUserRow>(
    `
      UPDATE storefront_auth_users
      SET last_seen_at = NOW(),
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `,
    [userId]
  );

  if (!result.rows[0]) {
    return null;
  }

  const user = mapUser(result.rows[0]);
  await syncMirror(user);
  return user;
}
