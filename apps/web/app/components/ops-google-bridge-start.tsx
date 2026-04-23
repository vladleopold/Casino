"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

type OpsGoogleBridgeStartProps = {
  callbackUrl: string;
};

export function OpsGoogleBridgeStart({ callbackUrl }: OpsGoogleBridgeStartProps) {
  useEffect(() => {
    void signIn("google", {
      callbackUrl
    });
  }, [callbackUrl]);

  return (
    <main className="slotcity-wallet-login-shell">
      <section className="slotcity-wallet-login-card">
        <span className="slotcity-wallet-login-kicker">GOOGLE BRIDGE</span>
        <h1>Перенаправлення до Google</h1>
        <p>
          Запускаємо безпечний Google-вхід через основний storefront, після чого передамо
          вас назад у фінансову адмінку.
        </p>
      </section>
    </main>
  );
}
