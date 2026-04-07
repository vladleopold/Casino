"use client";

import { useSlotcityAnalytics } from "./analytics-context";

export function ConsentBanner() {
  const { consentState, setConsentState } = useSlotcityAnalytics();

  if (consentState !== "pending") {
    return null;
  }

  return (
    <aside className="slotcity-consent-banner" aria-label="Analytics consent">
      <div className="slotcity-consent-copy">
        <span className="slotcity-section-kicker">Privacy</span>
        <strong>Дозволь аналітику та replay лише за згодою.</strong>
        <p>
          SlotCity storefront використовує product analytics для покращення витрини,
          експериментів і стабільності. Чутливі поля в pipeline відсікаються.
        </p>
      </div>
      <div className="slotcity-consent-actions">
        <button
          type="button"
          className="slotcity-auth-button slotcity-auth-button-dark"
          onClick={() => setConsentState("denied")}
        >
          Лише необхідне
        </button>
        <button
          type="button"
          className="slotcity-auth-button slotcity-auth-button-primary"
          onClick={() => setConsentState("granted")}
        >
          Дозволити analytics
        </button>
      </div>
    </aside>
  );
}
