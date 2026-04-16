import { Suspense } from "react";
import Image from "next/image";

import { LayoutShell } from "../../components/layout-shell";
import { MobileDock } from "../../components/mobile-dock";
import { RegistrationAuthPanel } from "../../components/registration-auth-panel";
import { Reveal } from "../../components/reveal";
import { SiteFooter } from "../../components/site-footer";
import { TrackedButton } from "../../components/tracked-button";
import { TrackedLink } from "../../components/tracked-link";

const registrationSteps = [
  {
    id: "phone",
    title: "Телефон або email",
    body: "Створіть акаунт за номером телефону, email або через чинний профіль Google чи Apple."
  },
  {
    id: "bonus",
    title: "Активуйте стартовий пакет",
    body: "Після створення профілю відкривається шлях до welcome-пропозицій, акцій і швидкого входу в каталог."
  },
  {
    id: "play",
    title: "Оберіть розділ і починайте",
    body: "Слоти, live-зали, турніри та добірки бонусних ігор доступні з першої ж сесії."
  }
];

export default function RegistrationPage() {
  return (
    <LayoutShell route="registration">
      <main className="slotcity-home slotcity-route-page slotcity-registration-page">
        <div className="slotcity-page-glow slotcity-page-glow-gold" />
        <div className="slotcity-page-glow slotcity-page-glow-green" />

        <section className="slotcity-registration-hero">
          <Reveal className="slotcity-registration-copy" data-block-id="registration-hero" delay={0.02}>
            <span className="slotcity-section-kicker">Реєстрація SlotCity</span>
            <h1>Швидкий вхід у каталог, бонуси та live-ігри</h1>
            <p>
              Сторінка реєстрації повторює логіку SlotCity: короткий сценарій входу, помітний стартовий бонус
              і прямі переходи до слотів, live та промо-кампаній без зайвих кроків.
            </p>
            <div className="slotcity-hero-actions">
              <TrackedButton className="slotcity-cta slotcity-cta-primary" event="cta_clicked" payload={{ properties: { route: "registration", placement: "hero_primary" } }}>
                Створити акаунт
              </TrackedButton>
              <TrackedLink href="/bonuses" className="slotcity-cta slotcity-cta-secondary" event="cta_clicked" payload={{ properties: { route: "registration", placement: "hero_secondary" } }}>
                Подивитися бонуси
              </TrackedLink>
            </div>
            <div className="slotcity-chip-row">
              <span>Телефон / email</span>
              <span>Google / Apple</span>
              <span>Швидкий старт у SlotCity</span>
            </div>
          </Reveal>

          <Reveal className="slotcity-registration-media" delay={0.08}>
            <Image
              src="/slotcity/assets/promos/welcome-lucky-season-slider.webp"
              alt="SlotCity registration bonus"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 620px"
              className="slotcity-hero-image"
            />
            <div className="slotcity-hero-overlay" />
            <div className="slotcity-registration-panel">
              <span className="slotcity-section-kicker">Стартовий пакет</span>
              <strong>500 000 ₴ + 700 ФС</strong>
              <p>Видимий бонусний блок, який веде користувача далі в каталог, акції та мобільний застосунок.</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Suspense fallback={null}>
              <RegistrationAuthPanel />
            </Suspense>
          </Reveal>
        </section>

        <Reveal className="slotcity-editorial-grid" delay={0.12}>
          {registrationSteps.map((item) => (
            <article key={item.id} className="slotcity-live-info-card">
              <span className="slotcity-section-kicker">Крок</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </Reveal>

        <Reveal className="slotcity-registration-links" delay={0.16}>
          <TrackedLink href="/catalog" className="slotcity-registration-link-tile" event="cta_clicked" payload={{ properties: { route: "registration", placement: "catalog_tile" } }}>
            <strong>Слоти</strong>
            <span>Перейти до каталогу ігор</span>
          </TrackedLink>
          <TrackedLink href="/live" className="slotcity-registration-link-tile" event="cta_clicked" payload={{ properties: { route: "registration", placement: "live_tile" } }}>
            <strong>Live</strong>
            <span>Відкрити live-зали</span>
          </TrackedLink>
          <TrackedLink href="/tournaments" className="slotcity-registration-link-tile" event="cta_clicked" payload={{ properties: { route: "registration", placement: "tournaments_tile" } }}>
            <strong>Турніри</strong>
            <span>Дивитися активні кампанії</span>
          </TrackedLink>
        </Reveal>

        <SiteFooter route="registration" />
        <MobileDock />
      </main>
    </LayoutShell>
  );
}
