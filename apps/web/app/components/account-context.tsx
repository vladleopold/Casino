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
import { usePathname } from "next/navigation";

import type { PlatformEvent } from "@slotcity/analytics-schema";

import { useSlotcityAnalytics } from "./analytics-context";

const SESSION_ACTIVITY_STORAGE_KEY = "slotcity.activity.session_started";
const SESSION_SYNC_RETRIES = 4;
const SESSION_SYNC_DELAY_MS = 250;

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

interface DepositRequestPayload {
  amount: number;
  paymentMethod: string;
  paymentProvider?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  notes?: string;
}

interface SlotcityAccountContextValue {
  account: SlotcityAccount | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hasGoogleAuth: boolean;
  isDepositModalOpen: boolean;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; message?: string }>;
  login: (payload: LoginPayload) => Promise<{ ok: boolean; message?: string }>;
  loginWithGoogle: (callbackUrl?: string) => Promise<void>;
  logout: () => void;
  requestDeposit: (placement: string) => Promise<void>;
  closeDepositModal: () => void;
  submitDepositRequest: (
    payload: DepositRequestPayload
  ) => Promise<{ ok: boolean; message?: string; depositId?: string }>;
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
  isDepositModalOpen: false,
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
  closeDepositModal() {},
  async submitDepositRequest() {
    return {
      ok: false,
      message: "Deposit flow is not ready."
    };
  },
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

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function SlotcityAccountProvider({ children }: { children: ReactNode }) {
  const { browserIds, capture, identify } = useSlotcityAnalytics();
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const [account, setAccount] = useState<SlotcityAccount | null>(null);
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositPlacement, setDepositPlacement] = useState("header_deposit");
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

  const runNonBlocking = (label: string, task: () => Promise<unknown>) => {
    void task().catch((error) => {
      console.error(`[slotcity-account] ${label} failed`, error);
    });
  };

  const resolveSignedInAccount = async () => {
    for (let attempt = 0; attempt < SESSION_SYNC_RETRIES; attempt += 1) {
      const nextSession = await getSession();
      const nextAccount = mapSessionAccount(nextSession);

      if (nextAccount) {
        return nextAccount;
      }

      if (attempt < SESSION_SYNC_RETRIES - 1) {
        await delay(SESSION_SYNC_DELAY_MS);
      }
    }

    return null;
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

  useEffect(() => {
    setIsDepositModalOpen(false);
  }, [pathname]);

  const register = async ({ email, password, username }: RegisterPayload) => {
    runNonBlocking("registration_started", async () => {
      await capture("registration_started", {
        properties: {
          route: "registration",
          path: getCurrentRoute(),
          method: "email"
        }
      });
    });

    try {
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

      const nextAccount = await resolveSignedInAccount();

      if (nextAccount) {
        setAccount(nextAccount);

        try {
          identify(nextAccount.userId, {
            username: nextAccount.username,
            account_status: nextAccount.status,
            balance: nextAccount.balance
          });
        } catch (error) {
          console.error("[slotcity-account] identify after registration failed", error);
        }

        runNonBlocking("registration_completed", async () => {
          await emitServerEvent("registration_completed", {
            userId: nextAccount.userId,
            properties: {
              route: "registration",
              path: getCurrentRoute(),
              method: "email",
              username: nextAccount.username
            }
          });
        });
      }

      return {
        ok: true
      };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error ? error.message : "Не вдалося створити користувача."
      };
    }
  };

  const login = async ({ email, password }: LoginPayload) => {
    try {
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

      const nextAccount = await resolveSignedInAccount();

      if (nextAccount) {
        setAccount(nextAccount);

        try {
          identify(nextAccount.userId, {
            username: nextAccount.username,
            account_status: nextAccount.status,
            balance: nextAccount.balance
          });
        } catch (error) {
          console.error("[slotcity-account] identify after login failed", error);
        }

        runNonBlocking("return_visit", async () => {
          await capture("return_visit", {
            userId: nextAccount.userId,
            properties: {
              route: "registration",
              path: getCurrentRoute(),
              username: nextAccount.username
            }
          });
        });
      }

      return {
        ok: true
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Не вдалося увійти."
      };
    }
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
    if (!account) {
      return;
    }

    setDepositPlacement(placement);
    setIsDepositModalOpen(true);
  };

  const closeDepositModal = () => {
    setIsDepositModalOpen(false);
  };

  const submitDepositRequest = async (requestPayload: DepositRequestPayload) => {
    if (!account || !browserIds) {
      return {
        ok: false,
        message: "Користувач не авторизований."
      };
    }

    await emitServerEvent("deposit_started", {
      properties: {
        route: "payments",
        placement: depositPlacement,
        amount: requestPayload.amount,
        payment_method: requestPayload.paymentMethod,
        payment_provider: requestPayload.paymentProvider ?? "manual-review"
      }
    });

    const response = await fetch("/api/account/deposit", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        amount: requestPayload.amount,
        paymentMethod: requestPayload.paymentMethod,
        paymentProvider: requestPayload.paymentProvider,
        payerName: requestPayload.payerName,
        payerEmail: requestPayload.payerEmail,
        payerPhone: requestPayload.payerPhone,
        notes: requestPayload.notes
      })
    });

    const responsePayload = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          message?: string;
          request?: {
            depositId?: string;
          };
        }
      | null;

    if (!response.ok || !responsePayload?.ok || !responsePayload.request?.depositId) {
      await emitServerEvent("deposit_failed", {
        properties: {
          route: "payments",
          placement: depositPlacement,
          amount: requestPayload.amount,
          payment_method: requestPayload.paymentMethod
        }
      });
      return {
        ok: false,
        message: responsePayload?.message ?? "Не вдалося створити заявку на поповнення."
      };
    }

    setIsDepositModalOpen(false);

    await emitServerEvent("cta_clicked", {
      properties: {
        route: "payments",
        placement: depositPlacement,
        amount: requestPayload.amount,
        payment_method: requestPayload.paymentMethod,
        deposit_id: responsePayload.request.depositId,
        state: "pending_review"
      }
    });

    await update();

    return {
      ok: true,
      depositId: responsePayload.request.depositId
    };
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
        isDepositModalOpen,
        register,
        login,
        loginWithGoogle,
        logout,
        requestDeposit,
        closeDepositModal,
        submitDepositRequest,
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
