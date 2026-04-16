"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { SlotcityAnalyticsProvider } from "./components/analytics-context";
import { SlotcityAccountProvider } from "./components/account-context";
import { ConsentBanner } from "./components/consent-banner";
import { StickyDepositCta } from "./components/sticky-deposit-cta";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SlotcityAnalyticsProvider>
      <SessionProvider refetchOnWindowFocus={false}>
        <SlotcityAccountProvider>
          {children}
          <ConsentBanner />
          <StickyDepositCta />
        </SlotcityAccountProvider>
      </SessionProvider>
    </SlotcityAnalyticsProvider>
  );
}
