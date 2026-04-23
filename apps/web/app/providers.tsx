"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { getAppKind } from "../lib/app-kind";
import { SlotcityAnalyticsProvider } from "./components/analytics-context";
import { SlotcityAccountProvider } from "./components/account-context";
import { ConsentBanner } from "./components/consent-banner";
import { DepositModal } from "./components/deposit-modal";
import { StickyDepositCta } from "./components/sticky-deposit-cta";

export function Providers({ children }: { children: ReactNode }) {
  if (getAppKind() === "ops") {
    return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
  }

  return (
    <SlotcityAnalyticsProvider>
      <SessionProvider refetchOnWindowFocus={false}>
        <SlotcityAccountProvider>
          {children}
          <ConsentBanner />
          <DepositModal />
          <StickyDepositCta />
        </SlotcityAccountProvider>
      </SessionProvider>
    </SlotcityAnalyticsProvider>
  );
}
