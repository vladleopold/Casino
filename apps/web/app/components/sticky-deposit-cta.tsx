"use client";

import { experimentFlags, featureFlags } from "@slotcity/flags-sdk";
import { useSlotcityAnalytics } from "./analytics-context";
import { TrackedLink } from "./tracked-link";

export function StickyDepositCta() {
  const { getFeatureVariant, isFeatureEnabled } = useSlotcityAnalytics();
  const isEnabled = isFeatureEnabled(featureFlags.stickyDepositCta);
  const variant = getFeatureVariant(experimentFlags.depositCta);

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="slotcity-sticky-cta-shell">
      <TrackedLink
        href="/catalog"
        className="slotcity-sticky-cta"
        event="cta_clicked"
        payload={{
          experiment: experimentFlags.depositCta,
          variant,
          properties: {
            placement: "sticky_deposit_cta"
          }
        }}
      >
        <span>Поповнити та грати</span>
        <strong>{variant === "compact" ? "Швидкий вхід" : "Відкрити каталог"}</strong>
      </TrackedLink>
    </div>
  );
}
