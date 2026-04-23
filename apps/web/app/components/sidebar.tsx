"use client";

import { TrackedLink } from "./tracked-link";
import { useSlotcityAccount } from "./account-context";

const quickLinks = [
  { label: "Каталог", href: "/catalog", kicker: "Ігри" },
  { label: "Live", href: "/live", kicker: "Швидко" },
  { label: "Бонуси", href: "/bonuses", kicker: "Промо" },
  { label: "CITY VIP", href: "/vip", kicker: "Club" }
];

const primaryLinks = [
  { label: "Головна", href: "/", note: "Поточна вітрина та нові банери" },
  { label: "Каталог слотів", href: "/catalog", note: "Пошук за грою, провайдером і колекцією" },
  { label: "Live casino", href: "/live", note: "Рулетка, blackjack, wheel-show та VIP столи" },
  { label: "Моє сіті", href: "/my-city", note: "Баланс, заявки на поповнення та журнал операцій" }
];

const promoLinks = [
  { label: "Бонуси", href: "/bonuses", note: "Вітальний пакет, кешбек і фриспіни" },
  { label: "Акції", href: "/promotions", note: "Поточні кампанії та сезонні офери" },
  { label: "Турніри", href: "/tournaments", note: "Щоденні гонки та таблиці лідерів" },
  { label: "CITY VIP", href: "/vip", note: "Преміальний клуб і персональні пропозиції" }
];

const supportLinks = [
  { label: "Мобільний застосунок", href: "/registration", note: "Встановлення на iOS та Android" },
  { label: "Правила та умови", href: "/promotions", note: "Основні правила, ліміти та вивід" },
  { label: "Відповідальна гра", href: "/bonuses", note: "Самообмеження та корисні контакти" }
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { account, isAuthenticated, logout, requestDeposit } = useSlotcityAccount();

  return (
    <>
      <div 
        className={`slotcity-sidebar-overlay ${isOpen ? "is-visible" : ""}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`slotcity-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="slotcity-sidebar-header">
          <button
            type="button"
            className="slotcity-icon-button slotcity-sidebar-close"
            aria-label="Close menu"
            onClick={onClose}
          >
            <span>✕</span>
          </button>
          <img src="/slotcity/brand/logo.png" alt="SlotCity" className="slotcity-sidebar-logo" />
          {isAuthenticated ? (
            <div className="slotcity-sidebar-user-id">
              <span>ID: {account?.userId}</span>
              <button
                type="button"
                className="slotcity-copy-button"
                onClick={() => navigator.clipboard.writeText(account?.userId ?? "")}
              >
                📄
              </button>
            </div>
          ) : (
            <div className="slotcity-sidebar-guest-auth">
              <TrackedLink
                href="/registration?mode=login"
                className="slotcity-sidebar-auth-link slotcity-sidebar-auth-link-dark"
                event="cta_clicked"
                payload={{ properties: { placement: "sidebar_login" } }}
              >
                Увійти
              </TrackedLink>
              <TrackedLink
                href="/registration"
                className="slotcity-sidebar-auth-link slotcity-sidebar-auth-link-primary"
                event="cta_clicked"
                payload={{ properties: { placement: "sidebar_register" } }}
              >
                Реєстрація
              </TrackedLink>
            </div>
          )}
        </div>

        <div className="slotcity-sidebar-body">
          {isAuthenticated ? (
            <div className="slotcity-sidebar-account-card">
              <div className="slotcity-sidebar-user-info">
                <div className="slotcity-sidebar-user-name">{account?.username}</div>
                <div className="slotcity-sidebar-user-status">Баланс: {account?.balance ?? 0} ₴</div>
              </div>

              <div className="slotcity-sidebar-progress-bar">
                <div className="slotcity-sidebar-progress-label">
                  <span>До 1-го рівня</span>
                  <span>2 / 6</span>
                </div>
                <div className="slotcity-sidebar-progress-track">
                  <div className="slotcity-sidebar-progress-fill" style={{ width: "33%" }} />
                </div>
              </div>

              <div className="slotcity-sidebar-hero-actions">
                <button
                  type="button"
                  className="slotcity-cta slotcity-cta-primary slotcity-sidebar-hero-action"
                  onClick={() => {
                    void requestDeposit("sidebar_account_deposit");
                  }}
                >
                  Поповнити
                </button>
                <button
                  type="button"
                  className="slotcity-cta slotcity-cta-secondary slotcity-sidebar-hero-action"
                  onClick={logout}
                >
                  Вийти
                </button>
              </div>
            </div>
          ) : (
            <section className="slotcity-sidebar-hero-card">
              <span className="slotcity-sidebar-hero-kicker">Вітальний бонус</span>
              <h2 className="slotcity-sidebar-hero-title">500 000 ₴ + 700 ФС</h2>
              <p className="slotcity-sidebar-hero-copy">
                Швидкий старт для нових гравців SlotCity з прямим входом у слоти, live та бонуси.
              </p>
              <div className="slotcity-sidebar-hero-actions">
                <TrackedLink
                  href="/registration"
                  className="slotcity-cta slotcity-cta-primary slotcity-sidebar-hero-action"
                  event="cta_clicked"
                  payload={{ properties: { placement: "sidebar_welcome_register" } }}
                >
                  Отримати бонус
                </TrackedLink>
                <TrackedLink
                  href="/registration?mode=login"
                  className="slotcity-cta slotcity-cta-secondary slotcity-sidebar-hero-action"
                  event="cta_clicked"
                  payload={{ properties: { placement: "sidebar_welcome_login" } }}
                >
                  Увійти
                </TrackedLink>
              </div>
            </section>
          )}

          <section className="slotcity-sidebar-quick-grid" aria-label="Швидкі переходи">
            {quickLinks.map((item) => (
              <TrackedLink
                key={item.href}
                href={item.href}
                className="slotcity-sidebar-quick-link"
                event="cta_clicked"
                payload={{ properties: { placement: "sidebar_quick_link", label: item.label } }}
              >
                <span className="slotcity-sidebar-quick-kicker">{item.kicker}</span>
                <strong>{item.label}</strong>
              </TrackedLink>
            ))}
          </section>

          <section className="slotcity-sidebar-section">
            <strong className="slotcity-sidebar-section-title">Основне</strong>
            <nav className="slotcity-sidebar-link-list">
              {primaryLinks.map((item) => (
                <TrackedLink
                  key={item.href}
                  href={item.href}
                  className="slotcity-sidebar-link-row"
                  event="cta_clicked"
                  payload={{ properties: { placement: "sidebar_nav", label: item.label } }}
                >
                  <span className="slotcity-sidebar-link-copy">
                    <strong>{item.label}</strong>
                    <small>{item.note}</small>
                  </span>
                  <span className="slotcity-sidebar-link-arrow">›</span>
                </TrackedLink>
              ))}
            </nav>
          </section>

          <section className="slotcity-sidebar-section">
            <strong className="slotcity-sidebar-section-title">Промо</strong>
            <div className="slotcity-sidebar-link-list">
              {promoLinks.map((item) => (
                <TrackedLink
                  key={item.href}
                  href={item.href}
                  className="slotcity-sidebar-link-row"
                  event="cta_clicked"
                  payload={{ properties: { placement: "sidebar_promo", label: item.label } }}
                >
                  <span className="slotcity-sidebar-link-copy">
                    <strong>{item.label}</strong>
                    <small>{item.note}</small>
                  </span>
                  <span className="slotcity-sidebar-link-arrow">›</span>
                </TrackedLink>
              ))}
            </div>
          </section>

          <section className="slotcity-sidebar-section">
            <strong className="slotcity-sidebar-section-title">Підтримка</strong>
            <div className="slotcity-sidebar-link-list">
              {supportLinks.map((item) => (
                <TrackedLink
                  key={item.href}
                  href={item.href}
                  className="slotcity-sidebar-link-row"
                  event="cta_clicked"
                  payload={{ properties: { placement: "sidebar_support", label: item.label } }}
                >
                  <span className="slotcity-sidebar-link-copy">
                    <strong>{item.label}</strong>
                    <small>{item.note}</small>
                  </span>
                  <span className="slotcity-sidebar-link-arrow">›</span>
                </TrackedLink>
              ))}
            </div>
          </section>

          <div className="slotcity-sidebar-apps">
            <span className="slotcity-sidebar-apps-label">Застосунок SlotCity</span>
            <button className="slotcity-sidebar-app-button">App Store</button>
            <button className="slotcity-sidebar-app-button">Google Play</button>
          </div>
        </div>
      </aside>
    </>
  );
}
