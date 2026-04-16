import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "../../../lib/auth/options";
import {
  isStoreAuthConfigured,
  listStorefrontUsersForAdmin
} from "../../../lib/auth/store-users";
import { LayoutShell } from "../../components/layout-shell";
import { MobileDock } from "../../components/mobile-dock";
import { Reveal } from "../../components/reveal";
import { SiteFooter } from "../../components/site-footer";

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function OperatorUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/registration?mode=login&next=/operator/users");
  }

  const users = isStoreAuthConfigured() ? await listStorefrontUsersForAdmin(120) : [];

  return (
    <LayoutShell route="registration">
      <main className="slotcity-home slotcity-route-page">
        <section className="slotcity-registration-hero">
          <Reveal className="slotcity-registration-copy" data-block-id="operator-users" delay={0.02}>
            <span className="slotcity-section-kicker">Оператор / користувачі</span>
            <h1>Зареєстровані користувачі storefront</h1>
            <p>
              Тут видно всіх користувачів, які зареєструвалися через email/password або Google.
              Дані беруться з PostgreSQL storefront-auth storage.
            </p>
            <div className="slotcity-chip-row">
              <span>Усього: {users.length}</span>
              <span>Авторизований як: {session.user.username}</span>
              <span>Провайдер входу: {session.user.authProvider}</span>
            </div>
          </Reveal>
        </section>

        {!isStoreAuthConfigured() ? (
          <section className="slotcity-live-info-card">
            <span className="slotcity-section-kicker">Конфігурація</span>
            <h3>Auth storage не налаштовано</h3>
            <p>
              Реєстрація і список користувачів стануть доступними після підключення production auth API до PostgreSQL.
            </p>
          </section>
        ) : null}

        <section className="slotcity-editorial-grid">
          {users.map((user: (typeof users)[number]) => (
            <article key={user.userId} className="slotcity-live-info-card">
              <span className="slotcity-section-kicker">{user.authProvider}</span>
              <h3>{user.displayName}</h3>
              <p>{user.email}</p>
              <div className="slotcity-chip-row">
                <span>{user.username}</span>
                <span>Баланс: {user.balance} ₴</span>
                <span>{user.status}</span>
              </div>
              <div className="slotcity-editorial-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <div>
                  <strong>Створено</strong>
                  <p>{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <strong>Останній вхід</strong>
                  <p>{formatDate(user.lastLoginAt)}</p>
                </div>
                <div>
                  <strong>Остання активність</strong>
                  <p>{formatDate(user.lastSeenAt)}</p>
                </div>
                <div>
                  <strong>ID</strong>
                  <p>{user.userId}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <SiteFooter route="registration" />
        <MobileDock />
      </main>
    </LayoutShell>
  );
}
