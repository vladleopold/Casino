import type { Route } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

import { LayoutShell } from "../../components/layout-shell";
import { MobileDock } from "../../components/mobile-dock";
import { Reveal } from "../../components/reveal";
import { TrackedLink } from "../../components/tracked-link";

type PromoPage = {
  kicker: string;
  title: string;
  body: string;
  image: string;
  chips: string[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

const promoPages: Record<string, PromoPage> = {
  "welcome-pack": {
    kicker: "Вітальний пакет",
    title: "Стартовий бонус для нової сесії в SlotCity",
    body: "Окрема промо-сторінка для стартового оферу, коротких умов і швидкого переходу в каталог або на реєстрацію.",
    image: "/slotcity/assets/promos/welcome-lucky-season-slider.webp",
    chips: ["500 000 ₴ + 700 ФС", "Перші депозити", "Швидкий старт"],
    primaryHref: "/registration",
    primaryLabel: "Зареєструватися",
    secondaryHref: "/bonuses",
    secondaryLabel: "Усі бонуси"
  },
  "city-vip": {
    kicker: "CITY VIP",
    title: "Преміальні офери, окремі зали та персональні пропозиції",
    body: "Детальна сторінка VIP-напряму зі входом у live, преміальними добірками та окремими бонусними сценаріями.",
    image: "/slotcity/assets/promos/city-vip-slider.webp",
    chips: ["VIP клуб", "Преміум lobby", "Персональні бонуси"],
    primaryHref: "/vip",
    primaryLabel: "Перейти у VIP",
    secondaryHref: "/live",
    secondaryLabel: "Відкрити live"
  },
  "lucky-season": {
    kicker: "Сезон удачі",
    title: "Турнірні кампанії, lucky journey та сезонні дропи",
    body: "Промо-деталь для сезонної кампанії з прямими маршрутами до турнірів, бонусів і ігрових добірок.",
    image: "/slotcity/assets/tournaments/lucky-season-promo-desktop.webp",
    chips: ["Турніри", "Prize drops", "Щоденні акції"],
    primaryHref: "/tournaments",
    primaryLabel: "Перейти до турнірів",
    secondaryHref: "/promotions",
    secondaryLabel: "Усі акції"
  }
};

export default async function PromotionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = promoPages[slug as keyof typeof promoPages];

  if (!page) {
    notFound();
  }

  return (
    <LayoutShell route="promotions">
      <main className="slotcity-home slotcity-route-page">
        <div className="slotcity-page-glow slotcity-page-glow-gold" />
        <div className="slotcity-page-glow slotcity-page-glow-green" />

        <section className="slotcity-registration-hero">
          <Reveal className="slotcity-registration-copy" data-block-id={`promo-${slug}`} delay={0.02}>
            <span className="slotcity-section-kicker">{page.kicker}</span>
            <h1>{page.title}</h1>
            <p>{page.body}</p>
            <div className="slotcity-hero-actions">
              <TrackedLink href={page.primaryHref as Route} className="slotcity-cta slotcity-cta-primary" event="cta_clicked">
                {page.primaryLabel}
              </TrackedLink>
              <TrackedLink href={page.secondaryHref as Route} className="slotcity-cta slotcity-cta-secondary" event="cta_clicked">
                {page.secondaryLabel}
              </TrackedLink>
            </div>
            <div className="slotcity-chip-row">
              {page.chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          </Reveal>

          <Reveal className="slotcity-registration-media" delay={0.08}>
            <Image
              src={page.image}
              alt={page.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 620px"
              className="slotcity-hero-image"
            />
            <div className="slotcity-hero-overlay" />
          </Reveal>
        </section>

        <MobileDock />
      </main>
    </LayoutShell>
  );
}
