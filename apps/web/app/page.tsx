import Image from "next/image";
import Link from "next/link";

import { getHomeRouteContent } from "@slotcity/cms-sdk";
import { Reveal } from "./components/reveal";
import { TrackedButton } from "./components/tracked-button";
import { TrackedGameCard } from "./components/tracked-game-card";
import { TrackedLink } from "./components/tracked-link";
import { TrackedScroller } from "./components/tracked-scroller";
import { LayoutShell } from "./components/layout-shell";
import { MobileDock } from "./components/mobile-dock";
import { PromotionSlider } from "./components/PromotionSlider";
import { HeroSlider } from "./components/hero-slider";
import { SideRail } from "./components/side-rail";

function MiniGamePill({ title, image }: { title: string; image: string }) {
  return (
    <div className="slotcity-mini-pill">
      <div className="slotcity-mini-pill-media">
        <Image src={image} alt={title} fill sizes="64px" />
      </div>
      <span>{title}</span>
    </div>
  );
}

function HeroDots() {
  return (
    <div className="slotcity-hero-dots" aria-hidden="true">
      <span className="is-active" />
      <span />
      <span />
    </div>
  );
}

export default async function HomePage() {
  let routeContent;
  try {
    routeContent = await getHomeRouteContent();
  } catch (error) {
    console.error("Failed to fetch home route content:", error);
    // Fallback to error state or re-throw if critical
    throw error;
  }

  if (!routeContent) {
    console.error("Home route content is empty or undefined");
    throw new Error("Missing home route content");
  }

  const {
    topSlots = [],
    bonusGames = [],
    liveGames = [],
    monthlyTop = [],
    quickPicks = [],
    heroPromos = [],
    welcomeGifts = [],
    sideRailItems = [],
    socialLinks = [],
    faqItems = [],
    providerHighlights = [],
    contactPoints = [],
    footerLinks = [],
    storeButtons = [],
    footerGroups = [],
    paymentMethods = [],
    seoIntro = [],
    bonusMatrix = [],
    bonusSlotPlan = [],
    appRequirements = [],
    androidSteps = [],
    iosSteps = [],
    responsiblePoints = []
  } = routeContent;

  return (
    <LayoutShell route="home">
      <main className="slotcity-home slotcity-home-page">
      <div className="slotcity-page-glow slotcity-page-glow-gold" />
      <div className="slotcity-page-glow slotcity-page-glow-green" />

      <SideRail
        route="home"
        items={sideRailItems.map((item) => ({
          ...item,
          href:
            item.id === "bonus"
              ? "/bonuses"
              : item.id === "top"
                ? "/#home-top-slots"
                : item.id === "live"
                  ? "/live"
                  : "/promotions"
        }))}
      />

      <h1 className="slotcity-sr-only">SlotCity казино онлайн</h1>

      <Reveal
        className="slotcity-promo-strip"
        data-block-id="home-promo-strip"
        data-block-name="Home promo strip"
        delay={0.02}
        trackView={{
          event: "banner_impression",
          payload: {
            bannerId: "home_promo_strip",
            properties: {
              route: "home"
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
                route: "home",
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

      <div data-block-id="home-hero-slider" data-block-name="Home hero slider">
        <HeroSlider />
      </div>

      <Reveal
        className="slotcity-bonus-bar"
        data-block-id="home-bonus-bar"
        data-block-name="Home bonus bar"
        delay={0.04}
        trackView={{
          event: "hero_impression",
          payload: {
            bannerId: "welcome_pack_bar",
            properties: {
              route: "home"
            }
          }
        }}
      >
        <div>
          <span className="slotcity-section-kicker">Вітальний бонус</span>
          <strong>500 000 ₴ + 700 ФС</strong>
        </div>
        <p>Швидкий старт для нових гравців SlotCity.</p>
        <div className="slotcity-bonus-actions">
          <TrackedLink
            href="/promotions/welcome-pack"
            className="slotcity-bonus-tab slotcity-bonus-tab-dark"
            event="cta_clicked"
            payload={{
              properties: {
                route: "home",
                placement: "bonus_bar_details"
              }
            }}
          >
            Деталі
          </TrackedLink>
          <TrackedLink
            href="/registration"
            className="slotcity-bonus-tab slotcity-bonus-tab-primary"
            event="cta_clicked"
            payload={{
              properties: {
                route: "home",
                placement: "bonus_bar_get"
              }
            }}
          >
            Отримати
          </TrackedLink>
        </div>
      </Reveal>

      <Reveal
        className="slotcity-section"
        data-block-id="home-top-slots"
        data-block-name="Top slots shelf"
        delay={0.08}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "home_top_slots"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>ТОП слоти</h2>
          <TrackedLink href="/slots" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "home", placement: "top_slots_header" } }}>Усі</TrackedLink>
        </div>
        <div className="slotcity-game-grid">
          {topSlots.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              gameId={game.id}
              shelfId="home_top_slots"
              position={index + 1}
            />
          ))}
        </div>
      </Reveal>

      <div className="slotcity-promo-strip" data-block-id="home-middle-banners" data-block-name="Middle banners">
        <Reveal className="slotcity-banner-strip" data-block-id="home-lucky-season-banner" data-block-name="Lucky Season banner" delay={0.1}>
        <Image
          src="/slotcity/assets/tournaments/lucky-season-promo-desktop.webp"
          alt="Lucky Season promo"
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="slotcity-banner-art"
        />
        <div className="slotcity-banner-copy">
          <span className="slotcity-section-kicker">Знову тут</span>
          <h2>У столиці розваг</h2>
          <p>Слоти, live та бонусні добірки без довгого пошуку.</p>
        </div>
        <div className="slotcity-banner-tags">
          <span>GO</span>
          <span>Roulette</span>
          <span>Live</span>
          <span>Top</span>
        </div>
      </Reveal>

      <Reveal className="slotcity-partner-banner" data-block-id="home-partner-banner" data-block-name="Partner banner" delay={0.11}>
        <Image
          src="/slotcity/assets/tournaments/spinjoy-spring-desktop.webp"
          alt="Spinjoy spring promo"
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="slotcity-partner-art"
        />
        <div className="slotcity-partner-copy">
          <span className="slotcity-section-kicker">abeplay</span>
          <h2>Партнерські банери та промо-тижні.</h2>
          <p>Сезонні банери та швидкий перехід до добірок ігор.</p>
          <div className="slotcity-provider-pills">
            {providerHighlights.map((provider) => (
              <span key={provider}>{provider}</span>
            ))}
          </div>
        </div>
        <TrackedLink href="/tournaments" className="slotcity-partner-accent" event="cta_clicked" payload={{ properties: { route: "home", placement: "partner_banner" } }}>
          <span>Промо-тижні</span>
          <span>Деталі</span>
        </TrackedLink>
      </Reveal>
      </div>

      <Reveal
        className="slotcity-mini-shelf"
        data-block-id="home-quick-picks"
        data-block-name="Quick picks shelf"
        delay={0.12}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "home_quick_picks"
          }
        }}
      >
        <TrackedScroller
          className="slotcity-mini-shelf-track"
          payload={{
            shelfId: "home_quick_picks"
          }}
        >
          {quickPicks.map((game) => (
            <MiniGamePill key={game.id} title={game.title} image={game.image} />
          ))}
        </TrackedScroller>
      </Reveal>

      <Reveal
        className="slotcity-section"
        data-block-id="home-live-shelf"
        data-block-name="Live casino shelf"
        delay={0.12}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "home_live"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>Live casino</h2>
          <TrackedLink href="/live" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "home", placement: "live_header" } }}>Усі</TrackedLink>
        </div>
        <div className="slotcity-live-grid">
          {liveGames.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              gameId={game.id}
              shelfId="home_live"
              position={index + 1}
            />
          ))}
        </div>
      </Reveal>

      <Reveal
        className="slotcity-section"
        data-block-id="home-bonus-games"
        data-block-name="Bonus games shelf"
        delay={0.14}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "home_bonus_games"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>Ігри для відіграшу бонусів</h2>
          <TrackedLink href="/bonuses" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "home", placement: "bonus_games_header" } }}>Усі</TrackedLink>
        </div>
        <div className="slotcity-game-grid">
          {bonusGames.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              gameId={game.id}
              shelfId="home_bonus_games"
              position={index + 1}
            />
          ))}
        </div>
      </Reveal>

      <Reveal
        className="slotcity-section"
        data-block-id="home-monthly-top"
        data-block-name="Monthly top shelf"
        delay={0.16}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "home_monthly_top"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>ТОП 10 місяця</h2>
          <TrackedLink href="/slots" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "home", placement: "monthly_top_header" } }}>Усі</TrackedLink>
        </div>
        <div className="slotcity-monthly-top-strip">
          {monthlyTop.map((game, index) => {
            const isFeatured = Number(game.rank) === 10;
            return (
              <TrackedLink
                key={game.id}
                href="/catalog"
                className={`slotcity-monthly-top-card ${isFeatured ? "slotcity-monthly-top-featured" : ""}`}
                aria-label={`${game.rank}. ${game.title}`}
                event="game_card_opened"
                payload={{
                  gameId: game.id,
                  shelfId: "home_monthly_top",
                  position: index + 1,
                  providerId: game.provider,
                  properties: {
                    title: game.title,
                    provider: game.provider
                  }
                }}
              >
                <div className="slotcity-monthly-top-media">
                  <Image
                    src={game.image}
                    alt={game.title}
                    fill
                    sizes={isFeatured ? "(max-width: 1232px) 100vw, 1200px" : "(max-width: 768px) 40vw, 180px"}
                    className="slotcity-monthly-top-image"
                  />
                  {game.rank ? <div className="slotcity-monthly-top-rank">{game.rank}</div> : null}
                  
                  {isFeatured && (
                    <div className="slotcity-monthly-top-featured-content">
                      <div className="slotcity-monthly-top-featured-badge">ГРА МІСЯЦЯ</div>
                      <h2>{game.title}</h2>
                      <p>Випробуй удачу у найпопулярнішому слоті цього місяця!</p>
                      <div className="slotcity-monthly-top-featured-cta">
                        ГРАТИ ЗАРАЗ
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14m-7-7 7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                {!isFeatured && <span className="slotcity-sr-only">{game.title}</span>}
              </TrackedLink>
            );
          })}
        </div>
      </Reveal>

      <Reveal className="slotcity-section" data-block-id="home-promotions" data-block-name="Promotions slider" delay={0.17}>
        <div className="slotcity-section-head">
          <h2>Акції</h2>
          <TrackedLink 
            href="/promotions" 
            className="slotcity-inline-link"
            event="banner_clicked"
            payload={{ bannerId: "all_promotions", properties: { route: "home", placement: "section_header" } }}
          >
            Усі
          </TrackedLink>
        </div>
        <PromotionSlider />
      </Reveal>

      <Reveal className="slotcity-app-grid" data-block-id="home-app-social-legal" data-block-name="App social legal section" delay={0.18}>
        <section className="slotcity-app-card">
          <span className="slotcity-section-kicker">Застосунок</span>
          <h2>Завантаж додаток Slot City й отримай 25 ФС.</h2>
          <p>Інсталюй застосунок та забери 25 ФС для старту.</p>
          <div className="slotcity-card-meta">
            <span>APK 77 МБ</span>
            <span>App Store 160,2 МБ</span>
            <span>Google Play / App Store</span>
          </div>
          <div className="slotcity-store-buttons">
            {storeButtons.map((button) => (
              <TrackedLink
                key={button.id}
                href={button.id === "google-play" ? "/registration?store=google-play" : "/registration?store=app-store"}
                className="slotcity-store-button"
                aria-label={`${button.title} ${button.caption}`}
                event="cta_clicked"
                payload={{
                  properties: {
                    route: "home",
                    placement: "store_button",
                    title: button.title
                  }
                }}
              >
                <Image
                  src={button.image}
                  alt=""
                  width={button.width}
                  height={button.height}
                  className="slotcity-store-button-image"
                />
                <span className="slotcity-sr-only">
                  {button.title} {button.caption}
                </span>
              </TrackedLink>
            ))}
          </div>
          <div className="slotcity-app-actions">
            <TrackedLink
              href="/registration"
              className="slotcity-auth-button slotcity-auth-button-primary"
              event="cta_clicked"
              payload={{
                properties: {
                  route: "home",
                  placement: "app_details"
                }
              }}
            >
              Деталі
            </TrackedLink>
          </div>
        </section>

        <section className="slotcity-social-card">
          <span className="slotcity-section-kicker">Соцмережі</span>
          <h2>Хочеш знати новини першим? Підписуйся!</h2>
          <p>Новини, турніри та бонусні пропозиції SlotCity в одному потоці.</p>
          <div className="slotcity-social-icons">
            {socialLinks.map((link) => (
              <TrackedLink
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className={`slotcity-social-icon tone-${link.tone}`}
                aria-label={link.label}
                event="cta_clicked"
                payload={{
                  properties: {
                    route: "home",
                    placement: "social_icon",
                    label: link.label
                  }
                }}
              >
                {link.mark}
              </TrackedLink>
            ))}
          </div>
          <div className="slotcity-social-links">
            {socialLinks.map((link) => (
              <TrackedLink
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                event="cta_clicked"
                payload={{
                  properties: {
                    route: "home",
                    placement: "social_link",
                    label: link.label
                  }
                }}
              >
                {link.label}
              </TrackedLink>
            ))}
          </div>
          <div className="slotcity-contact-list">
            {contactPoints.map((point) =>
              "href" in point ? (
                <a key={point.id} href={point.href}>
                  <strong>{point.label}</strong>
                  <span>{point.value}</span>
                </a>
              ) : (
                <div key={point.id}>
                  <strong>{point.label}</strong>
                  <span>{point.value}</span>
                </div>
              )
            )}
          </div>
        </section>

        <section className="slotcity-social-card slotcity-legal-card">
          <span className="slotcity-section-kicker">Відповідальна гра</span>
          <h2>Відповідальна гра та помітний legal-блок.</h2>
          <p>Якщо гра перестає бути розвагою, зверніться до підтримки або по кваліфіковану допомогу.</p>
          <div className="slotcity-card-meta">
            <span>Самообмеження від 6 місяців</span>
            <span>Support 24/7</span>
            <span>Рішення № 137-Р, 29.10.2025</span>
          </div>
        </section>
      </Reveal>

      <Reveal className="slotcity-faq-grid" data-block-id="home-faq" data-block-name="FAQ section" delay={0.2}>
        {faqItems.map((item) => (
          <article key={item.id} className="slotcity-faq-card">
            <span className="slotcity-section-kicker">FAQ</span>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </Reveal>

      <Reveal className="slotcity-mobile-info-hub" data-block-id="home-mobile-info" data-block-name="Mobile info hub" delay={0.21}>
        <article className="slotcity-mobile-info-card">
          <span className="slotcity-section-kicker">Швидко</span>
          <h3>Потрібні бонуси, правила чи застосунок?</h3>
          <p>На мобільному нижні інформаційні секції згорнуті, щоб не перевантажувати стрічку.</p>
        </article>
        <div className="slotcity-mobile-info-links">
          <TrackedLink href="/bonuses" className="slotcity-mobile-info-link" event="cta_clicked" payload={{ properties: { route: "home", placement: "mobile_info", label: "Бонуси" } }}>
            <strong>Бонуси</strong>
            <span>Відкрити стартові та сезонні офери</span>
          </TrackedLink>
          <TrackedLink href="/registration" className="slotcity-mobile-info-link" event="cta_clicked" payload={{ properties: { route: "home", placement: "mobile_info", label: "Застосунок" } }}>
            <strong>Застосунок</strong>
            <span>Подивитися встановлення та стартовий шлях</span>
          </TrackedLink>
          <TrackedLink href="/promotions" className="slotcity-mobile-info-link" event="cta_clicked" payload={{ properties: { route: "home", placement: "mobile_info", label: "Акції" } }}>
            <strong>Акції</strong>
            <span>Швидкий перехід до турнірів і промо</span>
          </TrackedLink>
        </div>
      </Reveal>

      <Reveal className="slotcity-seo-shell" data-block-id="home-seo" data-block-name="SEO content section" delay={0.22}>
        <section className="slotcity-seo-lead">
          <span className="slotcity-section-kicker">Слот Сіті казино України</span>
          <h2>Онлайн казино SlotCity це понад 7000 ігрових автоматів.</h2>
          {seoIntro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <div className="slotcity-seo-grid">
          <article className="slotcity-seo-card">
            <span className="slotcity-section-kicker">Вітальний пакет</span>
            <h3>Вітальний пакет 500 000 ₴ + 700 ФС.</h3>
            <p>
              Вітальний пакет 500 000 ₴ + 700 ФС це потужний старт для новачків, які щойно
              зареєструвалися на офіційному сайті Slot City.
            </p>
            <p>
              Активація бонусного пакета передбачає здійснення семи поповнень рахунку. Кожен
              депозит це можливість обрати один з трьох найкращих привілеїв.
            </p>
            <div className="slotcity-seo-matrix">
              <div className="slotcity-seo-matrix-row slotcity-seo-matrix-head">
                <strong>Послідовність та сума поповнення</strong>
                <span>100 ₴</span>
                <span>300 ₴</span>
                <span>500 ₴</span>
              </div>
              {bonusMatrix.map((row) => (
                <div key={row.id} className="slotcity-seo-matrix-row">
                  <strong>{row.label}</strong>
                  {row.values.map((value) => (
                    <span key={value}>{value}</span>
                  ))}
                </div>
              ))}
            </div>
            <ul className="slotcity-seo-list">
              {bonusSlotPlan.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="slotcity-seo-note">Усі бонуси повинні бути відіграні з вейджером х35.</p>
          </article>

          <article className="slotcity-seo-card">
            <span className="slotcity-section-kicker">Мобільний застосунок</span>
            <h3>Додаток Slot City для iOS та Android.</h3>
            <p>
              За інсталяцію додатка SlotCity гравцям нараховується 25 ФС для слота Magic Apple 2
              від 3 Oaks Gaming.
            </p>
            <div className="slotcity-seo-matrix slotcity-seo-matrix-compact">
              <div className="slotcity-seo-matrix-row slotcity-seo-matrix-head">
                <strong>Параметри</strong>
                <span>Android</span>
                <span>iOS</span>
              </div>
              {appRequirements.map((row) => (
                <div key={row.id} className="slotcity-seo-matrix-row slotcity-seo-matrix-compact-row">
                  <strong>{row.label}</strong>
                  <span>{row.android}</span>
                  <span>{row.ios}</span>
                </div>
              ))}
            </div>
            <div className="slotcity-seo-step-columns">
              <div>
                <strong>Android</strong>
                <ul className="slotcity-seo-list slotcity-seo-list-ordered">
                  {androidSteps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>iOS</strong>
                <ul className="slotcity-seo-list slotcity-seo-list-ordered">
                  {iosSteps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>

          <article className="slotcity-seo-card">
            <span className="slotcity-section-kicker">Відповідальна гра</span>
            <h3>Відповідальна гра має бути видимою прямо на головній.</h3>
            <ul className="slotcity-seo-list">
              {responsiblePoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="slotcity-card-meta">
              <span>Support 24/7</span>
              <span>Self-exclusion</span>
              <span>Responsible gaming</span>
            </div>
          </article>
        </div>
      </Reveal>

      <footer className="slotcity-footer" data-block-id="home-footer" data-block-name="Footer">
        <div className="slotcity-footer-brand">
          <strong>Slot City Casino</strong>
          <p>
            Онлайн казино SlotCity це понад 7000 ігрових автоматів, live-казино, бонуси,
            турніри та ліцензований формат гри для України.
          </p>
          <div className="slotcity-footer-payments">
            {paymentMethods.map((method) => (
              <span key={method}>{method}</span>
            ))}
          </div>
        </div>

        <div className="slotcity-footer-groups">
          {footerGroups.map((group) => (
            <section key={group.id} className="slotcity-footer-group">
              <strong>{group.title}</strong>
              <div className="slotcity-footer-links">
                {group.links.map((link) => (
                  <TrackedLink
                    key={link.id}
                    href={link.href}
                    event="cta_clicked"
                    payload={{
                      properties: {
                        route: "home",
                        placement: "footer_group",
                        label: link.label
                      }
                    }}
                  >
                    {link.label}
                  </TrackedLink>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="slotcity-footer-side">
          <div className="slotcity-footer-meta">
            <a href="mailto:support@slotcity.ua">support@slotcity.ua</a>
            <a href="tel:+380630213021">+380630213021</a>
            <span>пров. Ярославський, буд. 1/3, м. Київ, 04071, Украина</span>
          </div>
          <div className="slotcity-card-meta">
            <span>Ukraine</span>
            <span>Monday through Sunday, all day</span>
            <span>21+</span>
          </div>
        </div>
      </footer>

      <div className="slotcity-footer-bottom">
        <div className="slotcity-footer-bottom-links">
          {footerLinks.map((link) => (
            <TrackedLink
              key={link.id}
              href={link.href}
              event="cta_clicked"
              payload={{
                properties: {
                  route: "home",
                  placement: "footer_bottom",
                  label: link.label
                }
              }}
            >
              {link.label}
            </TrackedLink>
          ))}
        </div>
        <div className="slotcity-footer-bottom-note">
          <a href="mailto:support@slotcity.ua">support@slotcity.ua</a>
          <span>Slot City (Слот Сіті) • ліцензоване онлайн казино України</span>
        </div>
      </div>

      <MobileDock />
    </main>
    </LayoutShell>
  );
}
