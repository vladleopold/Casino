import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string;
      balance: number;
      status: string;
      authProvider: string;
      createdAt: string;
      lastLoginAt: string | null;
      lastSeenAt: string | null;
    };
  }

  interface User {
    id: string;
    username: string;
    balance: number;
    status: string;
    authProvider: string;
    createdAt: string;
    lastLoginAt: string | null;
    lastSeenAt: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    username?: string;
    balance?: number;
    status?: string;
    authProvider?: string;
    createdAt?: string;
    lastLoginAt?: string | null;
    lastSeenAt?: string | null;
  }
}
