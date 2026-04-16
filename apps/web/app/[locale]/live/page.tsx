import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { getLivePageData, getLiveRouteContent } from "@slotcity/cms-sdk";
import { Reveal } from "../../components/reveal";
import { TrackedGameCard } from "../../components/tracked-game-card";
import { TrackedLink } from "../../components/tracked-link";
import { TrackedScroller } from "../../components/tracked-scroller";
import { LayoutShell } from "../../components/layout-shell";
import { MobileDock } from "../../components/mobile-dock";
import { SideRail } from "../../components/side-rail";
import { SiteFooter } from "../../components/site-footer";

const sideRailItems = [
  { id: "lobby", label: "Lobby", short: "L" },
  { id: "vip", label: "VIP", short: "V" },
  { id: "tables", label: "Tables", short: "T" },
  { id: "app", label: "App", short: "A" }
] as const;

function HeroDots() {
  return (
    <div className="slotcity-hero-dots" aria-hidden="true">
      <span className="is-active" />
      <span />
      <span />
    </div>
  );
}

export default async function LivePage() {
  const [page, routeContent] = await Promise.all([
    getLivePageData(),
    getLiveRouteContent()
  ]);
  const {
    heroPromos,
    liveGames,
    primeTables,
    comebackTables,
    slotCrossSell,
    providerHighlights,
    footerSignals
  } = routeContent;

  return (
    <LayoutShell route="live">
      <main className="slotcity-home slotcity-live-page">
      <div className="slotcity-page-glow slotcity-page-glow-gold" />
      <div className="slotcity-page-glow slotcity-page-glow-green" />

      <SideRail
        route="live"
        items={sideRailItems.map((item) => ({
          ...item,
          href:
            item.id === "vip"
              ? "/vip"
              : item.id === "tables"
                ? "/live"
                : item.id === "app"
                  ? "/registration"
                  : "/live"
        }))}
      />


      <Reveal
        className="slotcity-promo-strip"
        delay={0.02}
        trackView={{
          event: "banner_impression",
          payload: {
            bannerId: "live_promo_strip",
            properties: {
              route: "live"
            }
          }
        }}
      >
        {heroPromos.map((promo) => (
          <TrackedLink
            key={promo.id}
            href={promo.href}
            className="slotcity-promo-card"
            event="banner_clicked"
            payload={{
              bannerId: promo.id,
              properties: {
                route: "live",
                title: promo.title
              }
            }}
          >
            <Image
              src={promo.image}
              alt={promo.title}
              fill
              sizes="(max-width: 920px) 100vw, 380px"
              className="slotcity-promo-card-image"
            />
            <div className="slotcity-promo-card-overlay" />
            <div className="slotcity-promo-card-content">
              <span>{promo.kicker}</span>
              <strong>{promo.title}</strong>
            </div>
          </TrackedLink>
        ))}
      </Reveal>

      <section className="slotcity-hero-grid slotcity-live-hero-grid">
        <Reveal className="slotcity-hero-card slotcity-hero-card-primary">
          <Image
            src="/slotcity/assets/promos/city-vip-slider.webp"
            alt="Live casino hero"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 760px"
            className="slotcity-hero-image"
          />
          <div className="slotcity-hero-overlay" />
          <div className="slotcity-hero-copy">
            <span className="slotcity-section-kicker">{page.hero.kicker}</span>
            <h1>{page.hero.title}</h1>
            <p>{page.hero.body}</p>
            <div className="slotcity-hero-actions">
              {page.hero.actions.map((action) => (
                <TrackedLink
                  key={action.id}
                  href={action.href as Route}
                  className={
                    action.variant === "primary"
                      ? "slotcity-cta slotcity-cta-primary"
                      : "slotcity-cta slotcity-cta-secondary"
                  }
                  event="cta_clicked"
                  payload={{
                    properties: {
                      route: "live",
                      placement: "hero_action",
                      label: action.label
                    }
                  }}
                >
                  {action.label}
                </TrackedLink>
              ))}
            </div>
            <div className="slotcity-chip-row">
              {page.hero.points.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <HeroDots />
          </div>
        </Reveal>

        <Reveal className="slotcity-hero-card slotcity-live-console" delay={0.08}>
          <Image
            src="/slotcity/assets/hero-card-live.webp"
            alt="Quick return"
            fill
            sizes="(max-width: 1024px) 100vw, 460px"
            className="slotcity-hero-image"
          />
          <div className="slotcity-hero-overlay slotcity-hero-overlay-secondary" />
          <div className="slotcity-live-console-copy">
            <div className="slotcity-live-console-head">
              <div>
                <span className="slotcity-section-kicker">{page.console.featuredLabel}</span>
                <h2>{page.console.featuredTitle}</h2>
              </div>
              <span className="slotcity-live-console-pill">Quick return</span>
            </div>
            <p>{page.console.featuredBody}</p>

            <div className="slotcity-live-return-grid">
              {page.quickReturn.map((item) => (
                <article key={item.id} className="slotcity-live-return-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>

            <div className="slotcity-live-mini-metrics">
              {page.console.footerCards.map((card) => (
                <article key={card.id} className="slotcity-live-mini-metric">
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <Reveal
        className="slotcity-section"
        delay={0.08}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "live_main_lobby"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>Live casino</h2>
          <TrackedLink href="/live" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "live", placement: "main_lobby_header" } }}>Усі</TrackedLink>
        </div>
        <div className="slotcity-live-grid">
          {liveGames.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              gameId={game.id}
              shelfId="live_main_lobby"
              position={index + 1}
            />
          ))}
        </div>
      </Reveal>

      <Reveal className="slotcity-banner-strip" delay={0.1}>
        <Image
          src="/slotcity/assets/tournaments/lucky-season-promo-desktop.webp"
          alt="Live return promo"
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="slotcity-banner-art"
        />
        <div className="slotcity-banner-copy">
          <span className="slotcity-section-kicker">Повернення</span>
          <h2>Швидке повернення у live casino</h2>
          <p>
            Останній стіл, VIP-зали та популярні live-шоу знаходяться поруч, щоб не шукати
            їх заново після кожного повернення у гру.
          </p>
        </div>
        <div className="slotcity-banner-tags">
          <span>VIP</span>
          <span>Roulette</span>
          <span>Wheel</span>
          <span>Live</span>
        </div>
      </Reveal>

      <Reveal
        className="slotcity-section"
        delay={0.12}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "live_comeback"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>Швидке повернення</h2>
          <TrackedLink href="/vip" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "live", placement: "comeback_header" } }}>Деталі</TrackedLink>
        </div>
        <div className="slotcity-live-grid">
          {comebackTables.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              gameId={game.id}
              shelfId="live_comeback"
              position={index + 1}
            />
          ))}
        </div>
      </Reveal>

      <Reveal className="slotcity-partner-banner" delay={0.14}>
        <Image
          src="/slotcity/assets/promos/city-vip-slider.webp"
          alt="VIP live promo"
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="slotcity-partner-art"
        />
        <div className="slotcity-partner-copy">
          <span className="slotcity-section-kicker">VIP / live</span>
          <h2>Преміальні столи, VIP-зони та live-шоу.</h2>
          <p>
            Для гравців, які люблять live casino, тут зібрані VIP-столи, швидке повернення
            до останніх сесій і окремі зали з популярними ведучими.
          </p>
          <div className="slotcity-provider-pills">
            {providerHighlights.map((provider) => (
              <span key={provider}>{provider}</span>
            ))}
          </div>
        </div>
        <TrackedLink href="/vip" className="slotcity-partner-accent" event="cta_clicked" payload={{ properties: { route: "live", placement: "partner_banner" } }}>
          <span>VIP</span>
          <span>Деталі</span>
        </TrackedLink>
      </Reveal>

      <Reveal
        className="slotcity-section"
        delay={0.16}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "live_prime_tables"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>VIP та преміум столи</h2>
          <TrackedLink href="/vip" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "live", placement: "prime_tables_header" } }}>Усі</TrackedLink>
        </div>
        <div className="slotcity-live-grid">
          {primeTables.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              gameId={game.id}
              shelfId="live_prime_tables"
              position={index + 1}
            />
          ))}
        </div>
      </Reveal>

      <Reveal
        className="slotcity-section"
        delay={0.18}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "live_slot_cross_sell"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>Популярні слоти поруч з live</h2>
          <TrackedLink href="/slots" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "live", placement: "cross_sell_header" } }}>Усі</TrackedLink>
        </div>
        <div className="slotcity-game-grid">
          {slotCrossSell.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              gameId={game.id}
              shelfId="live_slot_cross_sell"
              position={index + 1}
            />
          ))}
        </div>
      </Reveal>

      <SiteFooter route="live" />
      <MobileDock />
    </main>
    </LayoutShell>
  );
}
