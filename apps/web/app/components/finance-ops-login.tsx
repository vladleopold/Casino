"use client";

import { useSearchParams } from "next/navigation";

import { getPublicSiteUrl } from "../../lib/site-urls";

export function FinanceOpsLogin() {
  const searchParams = useSearchParams();
  const hasAccessError = searchParams.get("error") === "access_denied";
  const bridgeUrl = `${getPublicSiteUrl()}/ops/google/start?next=${encodeURIComponent(
    "/operator/payments"
  )}`;

  return (
    <main className="slotcity-wallet-login-shell">
      <section className="slotcity-wallet-login-card">
        <span className="slotcity-wallet-login-kicker">CASINO OPS</span>
        <h1>Фінансова адмінка SlotCity</h1>
        <p>
          Окремий ops-host. Доступ тільки через Google-вхід і тільки для пошт, які є в
          admin allowlist.
        </p>

        {hasAccessError ? (
          <div className="slotcity-registration-error">
            Ця Google-пошта ще не додана в список фінансових адміністраторів.
          </div>
        ) : null}

        <button
          type="button"
          className="slotcity-auth-button slotcity-auth-button-google slotcity-auth-button-google-ops"
          onClick={() => {
            window.location.assign(bridgeUrl);
          }}
        >
          <span>Увійти через </span>
          <span className="slotcity-auth-button-google-word">Google</span>
        </button>
      </section>
    </main>
  );
}
