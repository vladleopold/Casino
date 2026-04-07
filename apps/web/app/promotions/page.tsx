import type { Route } from "next";
import Image from "next/image";

import { getPromotionsRouteContent } from "@slotcity/cms-sdk";
import { LayoutShell } from "../components/layout-shell";
import { MobileDock } from "../components/mobile-dock";
import { Reveal } from "../components/reveal";
import { SiteFooter } from "../components/site-footer";
import { TrackedGameCard } from "../components/tracked-game-card";
import { TrackedLink } from "../components/tracked-link";

export default async function PromotionsPage() {
  const routeContent = await getPromotionsRouteContent();

  return (
    <LayoutShell route="promotions">
      <main className="slotcity-home slotcity-promotions-page">
        <div className="slotcity-page-glow slotcity-page-glow-gold" />
        <div className="slotcity-page-glow slotcity-page-glow-green" />

        <Reveal className="slotcity-promo-strip" delay={0.02}>
          {routeContent.heroPromos.map((promo) => (
            <TrackedLink key={promo.id} href={promo.href} className="slotcity-promo-card" event="banner_clicked" payload={{ bannerId: promo.id }}>
              <Image src={promo.image} alt={promo.title} fill sizes="(max-width: 920px) 100vw, 380px" className="slotcity-promo-card-image" />
              <div className="slotcity-promo-card-overlay" />
              <div className="slotcity-promo-card-content">
                <span>{promo.kicker}</span>
                <strong>{promo.title}</strong>
              </div>
            </TrackedLink>
          ))}
        </Reveal>

        <section className="slotcity-hero-grid slotcity-route-hero-grid">
          <Reveal className="slotcity-hero-card slotcity-hero-card-primary" data-block-id="promotions-hero">
            <Image src={routeContent.hero.image} alt={routeContent.hero.title} fill priority sizes="(max-width: 1024px) 100vw, 760px" className="slotcity-hero-image" />
            <div className="slotcity-hero-overlay" />
            <div className="slotcity-hero-copy">
              <span className="slotcity-section-kicker">{routeContent.hero.kicker}</span>
              <h1>{routeContent.hero.title}</h1>
              <p>{routeContent.hero.body}</p>
              <div className="slotcity-hero-actions">
                <TrackedLink href={routeContent.hero.primaryHref as Route} className="slotcity-cta slotcity-cta-primary" event="cta_clicked">
                  {routeContent.hero.primaryCta}
                </TrackedLink>
                <TrackedLink href={routeContent.hero.secondaryHref as Route} className="slotcity-cta slotcity-cta-secondary" event="cta_clicked">
                  {routeContent.hero.secondaryCta}
                </TrackedLink>
              </div>
              <div className="slotcity-chip-row">
                {routeContent.hero.chips.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="slotcity-route-side-stack">
            {routeContent.featuredPromotions.slice(0, 2).map((item) => (
              <Reveal key={item.id} className="slotcity-promo-card slotcity-route-side-card" delay={0.08}>
                <TrackedLink href={item.href} className="slotcity-route-side-link" event="banner_clicked" payload={{ bannerId: item.id }}>
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 1024px) 100vw, 420px" className="slotcity-promo-card-image" />
                  <div className="slotcity-promo-card-overlay" />
                  <div className="slotcity-route-side-copy">
                    <span className="slotcity-section-kicker">{item.kicker}</span>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                </TrackedLink>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal className="slotcity-section" delay={0.1}>
          <div className="slotcity-section-head">
            <h2>Welcome pack</h2>
          </div>
          <div className="slotcity-game-grid">
            {routeContent.welcomeGames.map((game, index) => (
              <TrackedGameCard key={game.id} title={game.title} provider={game.provider} image={game.image} gameId={game.id} shelfId="promotions_welcome" position={index + 1} />
            ))}
          </div>
        </Reveal>

        <Reveal className="slotcity-section" delay={0.12}>
          <div className="slotcity-section-head">
            <h2>Сезонні акції</h2>
          </div>
          <div className="slotcity-game-grid">
            {routeContent.seasonalGames.map((game, index) => (
              <TrackedGameCard key={game.id} title={game.title} provider={game.provider} image={game.image} gameId={game.id} shelfId="promotions_seasonal" position={index + 1} />
            ))}
          </div>
        </Reveal>

        <Reveal className="slotcity-editorial-grid" delay={0.14}>
          {routeContent.missions.map((item) => (
            <article key={item.id} className="slotcity-live-info-card">
              <span className="slotcity-section-kicker">{item.kicker}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </Reveal>

        <SiteFooter route="promotions" />
        <MobileDock />
      </main>
    </LayoutShell>
  );
}
