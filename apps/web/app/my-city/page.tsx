import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "../../lib/auth/options";
import { getStorefrontUserFinanceProfile } from "../../lib/auth/store-users";
import { LayoutShell } from "../components/layout-shell";
import { MobileDock } from "../components/mobile-dock";
import { OpenDepositButton } from "../components/open-deposit-button";
import { SiteFooter } from "../components/site-footer";

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function MyCityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/registration?mode=login&next=/my-city");
  }

  const profile = await getStorefrontUserFinanceProfile(session.user.id).catch(() => null);

  if (!profile) {
    return (
      <LayoutShell route="registration">
        <main className="slotcity-home slotcity-route-page">
          <section className="slotcity-registration-hero">
            <div className="slotcity-registration-copy">
              <span className="slotcity-section-kicker">Моє сіті</span>
              <h1>Кабінет тимчасово недоступний</h1>
              <p>
                Сервер фінансового профілю зараз не відповідає. Авторизація активна, але
                баланс і історія транзакцій поки не завантажилися.
              </p>
              <div className="slotcity-chip-row">
                <span>{session.user.email}</span>
                <span>{session.user.username}</span>
              </div>
            </div>

            <aside className="slotcity-live-info-card slotcity-player-cabinet-card">
              <span className="slotcity-section-kicker">Статус</span>
              <h2>Сервіс перевіряється</h2>
              <p>
                Спробуйте оновити сторінку трохи пізніше. Після відновлення з’являться баланс,
                ledger і заявки на поповнення.
              </p>
              <OpenDepositButton
                placement="my_city_primary"
                className="slotcity-cta slotcity-cta-primary"
              >
                Поповнити баланс
              </OpenDepositButton>
            </aside>
          </section>

          <SiteFooter route="registration" />
          <MobileDock />
        </main>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell route="registration">
      <main className="slotcity-home slotcity-route-page">
        <section className="slotcity-registration-hero">
          <div className="slotcity-registration-copy">
            <span className="slotcity-section-kicker">Моє сіті</span>
            <h1>Кабінет гравця</h1>
            <p>
              Тут зібрані баланс, історія заявок на поповнення, останні рухи по ledger і
              основні атрибути акаунта. Баланс зчитується тільки із серверної моделі.
            </p>
            <div className="slotcity-chip-row">
              <span>{profile.user.username}</span>
              <span>{profile.user.email}</span>
              <span>{profile.user.authProvider}</span>
            </div>
          </div>

          <aside className="slotcity-live-info-card slotcity-player-cabinet-card">
            <span className="slotcity-section-kicker">Поточний баланс</span>
            <h2>{profile.user.balance.toLocaleString("uk-UA")} ₴</h2>
            <p>
              Approved deposits: {profile.approvedDepositsAmount.toLocaleString("uk-UA")} ₴ ·
              Pending: {profile.pendingDepositsAmount.toLocaleString("uk-UA")} ₴
            </p>
            <div className="slotcity-chip-row">
              <span>Створено: {formatDate(profile.user.createdAt)}</span>
              <span>Останній вхід: {formatDate(profile.user.lastLoginAt)}</span>
            </div>
            <OpenDepositButton placement="my_city_primary" className="slotcity-cta slotcity-cta-primary">
              Поповнити баланс
            </OpenDepositButton>
          </aside>
        </section>

        <section className="slotcity-editorial-grid slotcity-finance-overview-grid">
          <article className="slotcity-live-info-card">
            <span className="slotcity-section-kicker">Approved</span>
            <h3>{profile.approvedDepositsCount}</h3>
            <p>Проведені поповнення, які вже потрапили в ledger.</p>
          </article>
          <article className="slotcity-live-info-card">
            <span className="slotcity-section-kicker">Pending</span>
            <h3>{profile.pendingDepositsCount}</h3>
            <p>Заявки, які ще чекають на операторське підтвердження.</p>
          </article>
          <article className="slotcity-live-info-card">
            <span className="slotcity-section-kicker">Provider</span>
            <h3>{profile.user.authProvider}</h3>
            <p>Активний спосіб входу і зв’язки облікового запису.</p>
          </article>
        </section>

        <section className="slotcity-editorial-grid slotcity-payments-grid">
          <article className="slotcity-live-info-card">
            <span className="slotcity-section-kicker">Deposit Requests</span>
            <h3>Останні заявки</h3>
            <div className="slotcity-payments-list">
              {profile.recentDeposits.map((request) => (
                <div key={request.depositId} className="slotcity-payment-row">
                  <div>
                    <strong>{request.amount.toLocaleString("uk-UA")} ₴</strong>
                    <p>
                      {request.paymentMethod} · {request.paymentProvider}
                    </p>
                    <small>
                      {request.status} · {formatDate(request.createdAt)}
                    </small>
                  </div>
                  <span className={`slotcity-payment-status is-${request.status}`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="slotcity-live-info-card">
            <span className="slotcity-section-kicker">Ledger</span>
            <h3>Рух коштів</h3>
            <div className="slotcity-payments-list">
              {profile.recentLedger.map((entry) => (
                <div key={entry.entryId} className="slotcity-payment-row">
                  <div>
                    <strong>{entry.amount.toLocaleString("uk-UA")} ₴</strong>
                    <p>
                      {entry.entryType} · {entry.paymentMethod ?? entry.source}
                    </p>
                    <small>
                      {entry.balanceBefore.toLocaleString("uk-UA")} →{" "}
                      {entry.balanceAfter.toLocaleString("uk-UA")} ₴
                    </small>
                  </div>
                  <span className="slotcity-payment-status is-posted">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <SiteFooter route="registration" />
        <MobileDock />
      </main>
    </LayoutShell>
  );
}
