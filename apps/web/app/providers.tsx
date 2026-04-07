"use client";

import type { ReactNode } from "react";

import { SlotcityAnalyticsProvider } from "./components/analytics-context";
import { ConsentBanner } from "./components/consent-banner";
import { StickyDepositCta } from "./components/sticky-deposit-cta";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SlotcityAnalyticsProvider>
      {children}
      <ConsentBanner />
      <StickyDepositCta />
    </SlotcityAnalyticsProvider>
  );
}
