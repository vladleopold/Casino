"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import {
  getProviders,
  getSession,
  signIn,
  signOut,
  useSession
} from "next-auth/react";

import type { PlatformEvent } from "@slotcity/analytics-schema";

import { useSlotcityAnalytics } from "./analytics-context";

const SESSION_ACTIVITY_STORAGE_KEY = "slotcity.activity.session_started";

export interface SlotcityAccount {
  userId: string;
  email: string;
  username: string;
  balance: number;
  createdAt: string;
  lastLoginAt: string | null;
  status: "active";
  authProvider: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  username?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface SlotcityAccountContextValue {
  account: SlotcityAccount | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hasGoogleAuth: boolean;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; message?: string }>;
  login: (payload: LoginPayload) => Promise<{ ok: boolean; message?: string }>;
  loginWithGoogle: (callbackUrl?: string) => Promise<void>;
  logout: () => void;
  requestDeposit: (placement: string) => Promise<void>;
  trackGameLaunch: (input: {
    slug: string;
    provider?: string;
    mode: "demo" | "real";
    targetUrl?: string;
    success: boolean;
  }) => Promise<void>;
}

const SlotcityAccountContext = createContext<SlotcityAccountContextValue>({
  account: null,
  isAuthenticated: false,
  isHydrated: false,
  hasGoogleAuth: false,
  async register() {
    return {
      ok: false,
      message: "Account provider is not ready."
    };
  },
  async login() {
    return {
      ok: false,
      message: "Account provider is not ready."
    };
  },
  async loginWithGoogle() {},
  logout() {},
  async requestDeposit() {},
  async trackGameLaunch() {}
});

function getCurrentRoute() {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}`;
}

function mapSessionAccount(
  session: ReturnType<typeof useSession>["data"]
): SlotcityAccount | null {
  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    username: session.user.username,
    balance: session.user.balance,
    createdAt: session.user.createdAt,
    lastLoginAt: session.user.lastLoginAt,
    status: "active",
    authProvider: session.user.authProvider
  };
}

export function SlotcityAccountProvider({ children }: { children: ReactNode }) {
  const { browserIds, capture, identify } = useSlotcityAnalytics();
  const { data: session, status, update } = useSession();
  const [account, setAccount] = useState<SlotcityAccount | null>(null);
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  const isHydrated = status !== "loading";

  const emitServerEvent = async (
    event: PlatformEvent["event"],
    input: {
      userId?: string;
      properties?: Record<string, unknown>;
      gameId?: string;
      providerId?: string;
    } = {}
  ) => {
    if (!browserIds) {
      return;
    }

    await fetch("/api/activity/server-event", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        event,
        sessionId: browserIds.sessionId,
        anonymousId: browserIds.anonymousId,
        userId: input.userId ?? account?.userId,
        locale: navigator.language,
        deviceType:
          window.innerWidth < 768 ? "mobile" : window.innerWidth < 1200 ? "tablet" : "desktop",
        gameId: input.gameId,
        providerId: input.providerId,
        properties: input.properties
      })
    });
  };

  useEffect(() => {
    setAccount(mapSessionAccount(session));
  }, [session]);

  useEffect(() => {
    let isActive = true;

    void getProviders()
      .then((providers) => {
        if (!isActive) {
          return;
        }

        setHasGoogleAuth(Boolean(providers?.google));
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setHasGoogleAuth(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || !account) {
      return;
    }

    identify(account.userId, {
      username: account.username,
      account_status: account.status,
      balance: account.balance,
      auth_provider: account.authProvider
    });
  }, [account, identify, isHydrated]);

  useEffect(() => {
    if (!browserIds || !isHydrated) {
      return;
    }

    const sessionKey = `${SESSION_ACTIVITY_STORAGE_KEY}:${browserIds.sessionId}`;

    if (window.sessionStorage.getItem(sessionKey)) {
      return;
    }

    window.sessionStorage.setItem(sessionKey, "1");

    void capture("session_started", {
      userId: account?.userId,
      properties: {
        account_state: account ? "authenticated" : "guest",
        path: getCurrentRoute()
      }
    });

    if (account) {
      void capture("return_visit", {
        userId: account.userId,
        properties: {
          username: account.username,
          path: getCurrentRoute()
        }
      });
    }
  }, [account, browserIds, capture, isHydrated]);

  const register = async ({ email, password, username }: RegisterPayload) => {
    await capture("registration_started", {
      properties: {
        route: "registration",
        path: getCurrentRoute(),
        method: "email"
      }
    });

    const response = await fetch("/api/account/register", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        username
      })
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          message?: string;
          user?: SlotcityAccount;
        }
      | null;

    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        message: payload?.message ?? "Не вдалося створити користувача."
      };
    }

    const signInResult = await signIn("credentials", {
      redirect: false,
      email,
      password
    });

    if (!signInResult?.ok) {
      return {
        ok: false,
        message: "Користувача створено, але автоматичний вхід не спрацював."
      };
    }

    const nextSession = await getSession();
    const nextAccount = mapSessionAccount(nextSession);

    if (nextAccount) {
      setAccount(nextAccount);
      identify(nextAccount.userId, {
        username: nextAccount.username,
        account_status: nextAccount.status,
        balance: nextAccount.balance
      });

      await emitServerEvent("registration_completed", {
        userId: nextAccount.userId,
        properties: {
          route: "registration",
          path: getCurrentRoute(),
          method: "email",
          username: nextAccount.username
        }
      });
    }

    return {
      ok: true
    };
  };

  const login = async ({ email, password }: LoginPayload) => {
    const signInResult = await signIn("credentials", {
      redirect: false,
      email,
      password
    });

    if (!signInResult?.ok) {
      return {
        ok: false,
        message: "Невірний email або пароль."
      };
    }

    const nextSession = await getSession();
    const nextAccount = mapSessionAccount(nextSession);

    if (nextAccount) {
      setAccount(nextAccount);
      identify(nextAccount.userId, {
        username: nextAccount.username,
        account_status: nextAccount.status,
        balance: nextAccount.balance
      });

      await capture("return_visit", {
        userId: nextAccount.userId,
        properties: {
          route: "registration",
          path: getCurrentRoute(),
          username: nextAccount.username
        }
      });
    }

    return {
      ok: true
    };
  };

  const loginWithGoogle = async (callbackUrl?: string) => {
    await signIn("google", {
      callbackUrl: callbackUrl || getCurrentRoute()
    });
  };

  const logout = () => {
    void signOut({
      redirect: false
    });
    setAccount(null);
  };

  const requestDeposit = async (placement: string) => {
    if (!account || !browserIds) {
      return;
    }

    const rawAmount = window.prompt("Сума поповнення", "500");

    if (!rawAmount) {
      return;
    }

    const amount = Number(rawAmount.replace(/[^\d.]/g, ""));

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    await emitServerEvent("deposit_started", {
      properties: {
        route: "payments",
        placement,
        amount
      }
    });

    const response = await fetch("/api/account/deposit", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        amount
      })
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          user?: SlotcityAccount;
        }
      | null;

    if (!response.ok || !payload?.ok || !payload.user) {
      await emitServerEvent("deposit_failed", {
        properties: {
          route: "payments",
          placement,
          amount
        }
      });
      return;
    }

    setAccount(payload.user);
    identify(payload.user.userId, {
      username: payload.user.username,
      account_status: payload.user.status,
      balance: payload.user.balance
    });

    await update({
      user: {
        ...session?.user,
        id: payload.user.userId,
        email: payload.user.email,
        username: payload.user.username,
        balance: payload.user.balance,
        status: payload.user.status,
        authProvider: payload.user.authProvider,
        createdAt: payload.user.createdAt,
        lastLoginAt: payload.user.lastLoginAt,
        lastSeenAt: new Date().toISOString()
      }
    });

    await emitServerEvent("deposit_succeeded", {
      properties: {
        route: "payments",
        placement,
        amount
      }
    });
  };

  const trackGameLaunch = async ({
    slug,
    provider,
    mode,
    targetUrl,
    success
  }: {
    slug: string;
    provider?: string;
    mode: "demo" | "real";
    targetUrl?: string;
    success: boolean;
  }) => {
    await capture("game_launch_started", {
      userId: account?.userId,
      gameId: slug,
      providerId: provider,
      properties: {
        route: "game",
        path: getCurrentRoute(),
        mode,
        target_url: targetUrl
      }
    });

    await emitServerEvent(success ? "game_launch_succeeded" : "game_launch_failed", {
      gameId: slug,
      providerId: provider,
      properties: {
        route: "game",
        path: getCurrentRoute(),
        mode,
        target_url: targetUrl,
        authenticated: Boolean(account)
      }
    });
  };

  return (
    <SlotcityAccountContext.Provider
      value={{
        account,
        isAuthenticated: Boolean(account),
        isHydrated,
        hasGoogleAuth,
        register,
        login,
        loginWithGoogle,
        logout,
        requestDeposit,
        trackGameLaunch
      }}
    >
      {children}
    </SlotcityAccountContext.Provider>
  );
}

export function useSlotcityAccount() {
  return useContext(SlotcityAccountContext);
}
