import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { isOpsApp } from "../app-kind";
import { getFinanceAdminUserByEmail } from "./finance-admin";
import {
  getStorefrontUserById,
  touchUserSeen,
  upsertGoogleUser,
  verifyCredentialUser,
  type StorefrontUser
} from "./store-users";

function toAuthUser(user: StorefrontUser) {
  return {
    id: user.userId,
    email: user.email,
    name: user.displayName || user.username,
    image: user.avatarUrl ?? undefined,
    username: user.username,
    balance: user.balance,
    status: user.status,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt ?? null,
    lastSeenAt: user.lastSeenAt ?? null
  } satisfies User;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim();
const OPS_APP = isOpsApp();

const providers: NextAuthOptions["providers"] = [];

if (!OPS_APP) {
  providers.push(
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: {
          label: "Email",
          type: "email"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await verifyCredentialUser({
          email,
          password
        });

        return user ? toAuthUser(user) : null;
      }
    })
  );
}

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET
    })
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: OPS_APP ? "/login" : "/registration?mode=login"
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (OPS_APP) {
        if (account?.provider !== "google" || !user.email) {
          return "/login?error=access_denied";
        }

        const admin = await getFinanceAdminUserByEmail(user.email);

        if (!admin) {
          return "/login?error=access_denied";
        }

        user.id = admin.adminId;
        user.name = user.name || admin.email;
        user.username = admin.email;
        user.balance = 0;
        user.status = admin.role;
        user.authProvider = "google";
        user.createdAt = admin.createdAt;
        user.lastLoginAt = new Date().toISOString();
        user.lastSeenAt = new Date().toISOString();
        return true;
      }

      if (account?.provider !== "google" || !user.email) {
        return true;
      }

      const synced = await upsertGoogleUser({
        email: user.email,
        googleSubject: account.providerAccountId,
        displayName: user.name,
        avatarUrl: user.image,
        emailVerifiedAt: new Date().toISOString()
      });

      user.id = synced.userId;
      user.name = synced.displayName;
      user.image = synced.avatarUrl ?? undefined;
      (user as typeof user & { username?: string }).username = synced.username;
      (user as typeof user & { balance?: number }).balance = synced.balance;
      (user as typeof user & { status?: string }).status = synced.status;
      (user as typeof user & { authProvider?: string }).authProvider = synced.authProvider;
      (user as typeof user & { createdAt?: string }).createdAt = synced.createdAt;
      (user as typeof user & { lastLoginAt?: string | null }).lastLoginAt =
        synced.lastLoginAt ?? null;
      (user as typeof user & { lastSeenAt?: string | null }).lastSeenAt =
        synced.lastSeenAt ?? null;
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (OPS_APP) {
        if (user) {
          token.userId = user.id;
          token.email = user.email;
          token.username =
            "username" in user && typeof user.username === "string"
              ? user.username
              : user.email?.toLowerCase() || "";
          token.balance = 0;
          token.status =
            "status" in user && typeof user.status === "string" ? user.status : "admin";
          token.authProvider = "google";
          token.createdAt =
            "createdAt" in user && typeof user.createdAt === "string"
              ? user.createdAt
              : new Date().toISOString();
          token.lastLoginAt = new Date().toISOString();
          token.lastSeenAt = new Date().toISOString();
          token.picture = user.image;
        }

        if (trigger === "update" && session.user) {
          token.username = session.user.username;
          token.status = session.user.status;
          token.createdAt = session.user.createdAt;
          token.lastLoginAt = session.user.lastLoginAt;
          token.lastSeenAt = session.user.lastSeenAt;
          token.picture = session.user.image;
        }

        if (typeof token.email === "string") {
          const admin = await getFinanceAdminUserByEmail(token.email);

          if (!admin) {
            return {};
          }

          token.userId = admin.adminId;
          token.username = admin.email;
          token.balance = 0;
          token.status = admin.role;
          token.authProvider = "google";
          token.createdAt = admin.createdAt;
          token.lastSeenAt = new Date().toISOString();
        }

        return token;
      }

      if (user) {
        token.userId = user.id;
        token.username =
          "username" in user && typeof user.username === "string"
            ? user.username
            : user.email?.split("@")[0] || "slotcity_user";
        token.balance =
          "balance" in user && typeof user.balance === "number" ? user.balance : 0;
        token.status =
          "status" in user && typeof user.status === "string" ? user.status : "active";
        token.authProvider =
          "authProvider" in user && typeof user.authProvider === "string"
            ? user.authProvider
            : "credentials";
        token.createdAt =
          "createdAt" in user && typeof user.createdAt === "string"
            ? user.createdAt
            : new Date().toISOString();
        token.lastLoginAt =
          "lastLoginAt" in user && typeof user.lastLoginAt === "string"
            ? user.lastLoginAt
            : null;
        token.lastSeenAt =
          "lastSeenAt" in user && typeof user.lastSeenAt === "string"
            ? user.lastSeenAt
            : null;
        token.picture = user.image;
      }

      if (trigger === "update" && session.user) {
        token.username = session.user.username;
        token.balance = session.user.balance;
        token.status = session.user.status;
        token.authProvider = session.user.authProvider;
        token.createdAt = session.user.createdAt;
        token.lastLoginAt = session.user.lastLoginAt;
        token.lastSeenAt = session.user.lastSeenAt;
        token.picture = session.user.image;
      }

      if (typeof token.userId === "string") {
        const refreshed = await getStorefrontUserById(token.userId);

        if (refreshed) {
          token.email = refreshed.email;
          token.username = refreshed.username;
          token.balance = refreshed.balance;
          token.status = refreshed.status;
          token.authProvider = refreshed.authProvider;
          token.createdAt = refreshed.createdAt;
          token.lastLoginAt = refreshed.lastLoginAt;
          token.lastSeenAt = refreshed.lastSeenAt;
          token.picture = refreshed.avatarUrl ?? undefined;
          void touchUserSeen(refreshed.userId);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      if (OPS_APP) {
        session.user.id = typeof token.userId === "string" ? token.userId : token.sub || "";
        session.user.username =
          typeof token.username === "string" ? token.username : session.user.email?.toLowerCase() || "";
        session.user.balance = 0;
        session.user.status = typeof token.status === "string" ? token.status : "admin";
        session.user.authProvider = "google";
        session.user.createdAt =
          typeof token.createdAt === "string" ? token.createdAt : new Date().toISOString();
        session.user.lastLoginAt =
          typeof token.lastLoginAt === "string" ? token.lastLoginAt : null;
        session.user.lastSeenAt =
          typeof token.lastSeenAt === "string" ? token.lastSeenAt : null;
        session.user.image =
          typeof token.picture === "string" ? token.picture : session.user.image;

        return session;
      }

      session.user.id = typeof token.userId === "string" ? token.userId : token.sub || "";
      session.user.username =
        typeof token.username === "string" ? token.username : session.user.email?.split("@")[0] || "slotcity_user";
      session.user.balance = typeof token.balance === "number" ? token.balance : 0;
      session.user.status = typeof token.status === "string" ? token.status : "active";
      session.user.authProvider =
        typeof token.authProvider === "string" ? token.authProvider : "credentials";
      session.user.createdAt =
        typeof token.createdAt === "string" ? token.createdAt : new Date().toISOString();
      session.user.lastLoginAt =
        typeof token.lastLoginAt === "string" ? token.lastLoginAt : null;
      session.user.lastSeenAt =
        typeof token.lastSeenAt === "string" ? token.lastSeenAt : null;
      session.user.image =
        typeof token.picture === "string" ? token.picture : session.user.image;

      return session;
    }
  }
};
